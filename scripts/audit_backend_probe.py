"""Dynamic backend audit: curl every registered DRF endpoint, record status.

Probes each URL from docs/audit/static.json (backend_router_urls + backend_paths)
using an authenticated teacher JWT. Writes results to docs/audit/backend_probe.json.

Assumes Django is already running on http://127.0.0.1:8765/.
Run Django with: cd edify_backend && ./venv/bin/python manage.py runserver 127.0.0.1:8765
"""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN = ROOT / "docs" / "audit" / "static.json"
OUT = ROOT / "docs" / "audit" / "backend_probe.json"
BASE = "http://127.0.0.1:8765"


def http(method: str, url: str, headers: dict | None = None, body: bytes | None = None, timeout: float = 10.0, full_body: bool = False) -> dict:
    t0 = time.time()
    req = urllib.request.Request(url, method=method, headers=headers or {}, data=body)
    read_bytes = 65536 if full_body else 1024
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read(read_bytes)
            return {
                "status": resp.status,
                "elapsed_ms": int((time.time() - t0) * 1000),
                "body": raw.decode("utf-8", errors="replace") if full_body else None,
                "preview": raw[:200].decode("utf-8", errors="replace"),
                "error": None,
            }
    except urllib.error.HTTPError as e:
        raw = e.read(read_bytes) if e.fp else b""
        return {
            "status": e.code,
            "elapsed_ms": int((time.time() - t0) * 1000),
            "body": raw.decode("utf-8", errors="replace") if full_body else None,
            "preview": raw[:200].decode("utf-8", errors="replace"),
            "error": None,
        }
    except Exception as e:
        return {
            "status": None,
            "elapsed_ms": int((time.time() - t0) * 1000),
            "body": None,
            "preview": "",
            "error": f"{type(e).__name__}: {e}",
        }


def main() -> None:
    if not IN.exists():
        print(f"Missing {IN}. Run scripts/audit.py first.", file=sys.stderr)
        sys.exit(1)
    static = json.loads(IN.read_text())
    endpoints = sorted(set(static["backend_router_urls"]))

    # ── Health pre-flight ──
    health = http("GET", f"{BASE}/api/health/")
    if health["status"] != 200:
        print(f"Django not healthy at {BASE} (status={health['status']}). Aborting.", file=sys.stderr)
        sys.exit(2)

    # ── Register + login a teacher ──
    stamp = int(time.time())
    email = f"audit.t.{stamp}@edify.test"
    password = "AuditPass!"
    http(
        "POST",
        f"{BASE}/api/v1/auth/register/",
        headers={"Content-Type": "application/json"},
        body=json.dumps({
            "email": email,
            "full_name": "Audit Teacher",
            "country_code": "UG",
            "password": password,
            "role": "teacher",
        }).encode(),
    )
    tok = http(
        "POST",
        f"{BASE}/api/v1/auth/token/",
        headers={"Content-Type": "application/json"},
        body=json.dumps({"email": email, "password": password}).encode(),
        full_body=True,
    )
    if tok["status"] != 200:
        print(f"Could not log in audit teacher (status={tok['status']}); aborting", file=sys.stderr)
        sys.exit(3)
    access = json.loads(tok["body"])["access"]
    auth_headers = {"Authorization": f"Bearer {access}"}

    # ── Probe each endpoint ──
    results: list[dict] = []
    for url in endpoints:
        absolute = f"{BASE}{url}"
        # Anonymous GET (checks whether endpoint requires auth)
        anon = http("GET", absolute)
        authed = http("GET", absolute, headers=auth_headers)
        results.append({
            "url": url,
            "anon_status": anon["status"],
            "authed_status": authed["status"],
            "authed_elapsed_ms": authed["elapsed_ms"],
            "authed_preview": authed["preview"][:120],
            "authed_error": authed["error"],
        })

    # ── Summarise ──
    OUT.write_text(json.dumps({
        "health": health,
        "endpoints_probed": len(results),
        "results": results,
    }, indent=2))
    print(f"\nBackend probe written to {OUT}")
    # Friendly summary: count by authed status
    from collections import Counter
    authed_by_status = Counter(r["authed_status"] for r in results)
    anon_by_status = Counter(r["anon_status"] for r in results)
    print(f"\nauthed status distribution: {dict(authed_by_status)}")
    print(f"anon status distribution:   {dict(anon_by_status)}")
    errors = [r for r in results if r["authed_error"] or (r["authed_status"] or 500) >= 500]
    if errors:
        print(f"\n{len(errors)} endpoints returned 5xx or failed to respond:")
        for r in errors[:15]:
            print(f"  {r['url']}: status={r['authed_status']} error={r['authed_error']}")
    slow = sorted(results, key=lambda r: r["authed_elapsed_ms"] or 0, reverse=True)[:10]
    print("\nslowest authed GETs:")
    for r in slow:
        print(f"  {r['authed_elapsed_ms']:5d} ms  {r['url']}")


if __name__ == "__main__":
    main()
