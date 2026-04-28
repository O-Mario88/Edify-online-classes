import React from 'react';

interface Props {
  children: React.ReactNode;
}

/**
 * Paywall removed — this component is now a transparent pass-through.
 * Kept as a stable export so the role layouts that wrap their tabs in
 * `<PaywallGate>` continue to compile without churn.
 */
export const PaywallGate: React.FC<Props> = ({ children }) => <>{children}</>;
