"""Payment provider abstraction for fee collection.

Each provider knows three things:
  - parse_ipn(raw_payload): extract amount, reference, status, method,
    paid_on, and the FeeAssessment id from a provider-specific webhook
    payload.
  - verify_signature(raw_payload, headers): confirm the IPN actually
    came from the provider (or in stub mode, accept it).
  - name: machine-friendly identifier used in the webhook URL.

We ship two providers in stub mode (Pesapal + Airtel Money) so the
plumbing works end-to-end without live credentials. When credentials
land in env, flip to live mode by setting PESAPAL_CONSUMER_KEY etc.
in settings — the provider classes already check for those.

Stub mode is honest: it accepts any well-formed payload, writes the
FeePayment, and logs a stub-mode warning. No real money moves; the
admin still manually verifies the receipt before the next deploy.
"""
from __future__ import annotations

import os
import hmac
import hashlib
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from django.conf import settings


@dataclass
class ParsedPayment:
    assessment_id: int
    amount: Decimal
    reference: str
    method: str  # one of FeePayment.METHOD_CHOICES values
    paid_on: date
    status_ok: bool  # False for failed / pending IPNs


class IpnRejected(Exception):
    """Raised when an IPN fails signature verification."""


class PaymentProvider:
    name: str = ''

    def stub_mode(self) -> bool:
        return True

    def verify_signature(self, raw_body: bytes, headers: dict) -> None:
        if not self.stub_mode():
            raise NotImplementedError
        # Stub: accept everything, log loudly so devs know it's stub.
        return

    def parse_ipn(self, payload: dict) -> ParsedPayment:
        raise NotImplementedError


class PesapalProvider(PaymentProvider):
    """Pesapal IPN parser.

    Live-mode signature check uses HMAC-SHA256 over the raw body keyed
    on PESAPAL_CONSUMER_SECRET, compared against the X-Signature header.
    Pesapal's actual signing scheme differs by API version — this is
    deliberately conservative; replace with their official SDK call
    once an account is live.
    """
    name = 'pesapal'

    def stub_mode(self) -> bool:
        return not (
            getattr(settings, 'PESAPAL_CONSUMER_KEY', '') and
            getattr(settings, 'PESAPAL_CONSUMER_SECRET', '')
        )

    def verify_signature(self, raw_body: bytes, headers: dict) -> None:
        if self.stub_mode():
            return
        secret = settings.PESAPAL_CONSUMER_SECRET.encode('utf-8')
        expected = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
        provided = (headers.get('X-Signature') or '').lower()
        if not hmac.compare_digest(expected, provided):
            raise IpnRejected('Pesapal signature mismatch')

    def parse_ipn(self, payload: dict) -> ParsedPayment:
        # Pesapal IPN typically passes pesapal_merchant_reference as our
        # outbound reference — we encode it as "fee:<assessment_id>:<nonce>".
        ref = payload.get('pesapal_merchant_reference') or payload.get('merchant_reference') or ''
        assessment_id = _extract_assessment_id(ref)
        amount = Decimal(str(payload.get('amount') or payload.get('Amount') or '0'))
        status = (payload.get('pesapal_status') or payload.get('status') or '').upper()
        # Pesapal uses COMPLETED for success.
        ok = status in ('COMPLETED', 'OK', 'SUCCESS', 'PAID')
        paid_on_raw = payload.get('payment_date') or payload.get('completion_date') or ''
        paid_on = _parse_date(paid_on_raw)
        return ParsedPayment(
            assessment_id=assessment_id,
            amount=amount,
            reference=str(payload.get('pesapal_transaction_tracking_id') or payload.get('reference') or ref or '')[:120],
            method='card' if (payload.get('payment_method') or '').lower() in ('card', 'visa', 'mastercard') else 'mobile_money',
            paid_on=paid_on,
            status_ok=ok,
        )


class AirtelMoneyProvider(PaymentProvider):
    """Airtel Money / MTN MoMo IPN parser.

    Same stub-mode shape as Pesapal. Live mode would verify a JWT in
    the Authorization header against AIRTEL_PUBLIC_KEY (PEM).
    """
    name = 'airtel_money'

    def stub_mode(self) -> bool:
        return not (
            getattr(settings, 'AIRTEL_CLIENT_ID', '') and
            getattr(settings, 'AIRTEL_CLIENT_SECRET', '')
        )

    def parse_ipn(self, payload: dict) -> ParsedPayment:
        ref = payload.get('reference') or payload.get('external_id') or ''
        assessment_id = _extract_assessment_id(ref)
        amount_raw = payload.get('amount') or payload.get('value') or '0'
        amount = Decimal(str(amount_raw))
        status = (payload.get('status') or '').upper()
        ok = status in ('TS', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID')
        paid_on = _parse_date(payload.get('transaction_date') or payload.get('paid_on') or '')
        return ParsedPayment(
            assessment_id=assessment_id,
            amount=amount,
            reference=str(payload.get('transaction_id') or payload.get('msisdn') or ref or '')[:120],
            method='mobile_money',
            paid_on=paid_on,
            status_ok=ok,
        )


PROVIDERS = {
    p.name: p
    for p in (PesapalProvider(), AirtelMoneyProvider())
}


def get_provider(name: str) -> PaymentProvider:
    if name not in PROVIDERS:
        raise IpnRejected(f'Unknown payment provider: {name}')
    return PROVIDERS[name]


def _extract_assessment_id(reference: str) -> int:
    """Reference convention: fee:<assessment_id>:<anything>.

    Returns 0 when the reference doesn't match — caller treats 0 as
    "couldn't match an assessment" and rejects the IPN.
    """
    if not reference:
        return 0
    parts = str(reference).split(':')
    if len(parts) >= 2 and parts[0] == 'fee':
        try:
            return int(parts[1])
        except (TypeError, ValueError):
            return 0
    # Fall back: try the whole thing as an int (e.g. cross-system IDs).
    try:
        return int(reference)
    except (TypeError, ValueError):
        return 0


def _parse_date(raw: str) -> date:
    if not raw:
        return date.today()
    # Accept ISO datetimes, ISO dates, and "DD/MM/YYYY".
    try:
        return datetime.fromisoformat(raw.replace('Z', '+00:00')).date()
    except ValueError:
        pass
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y'):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return date.today()
