"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { WalletSetup } from "@/components/wallet/WalletSetup";

export function PrivyProvider({ appId, children }: { appId: string; children: React.ReactNode }) {
  return (
    <Privy appId={appId}>
      {children}
      <WalletSetup />
    </Privy>
  );
}
