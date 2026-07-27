"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import type { Chain } from "@privy-io/js-sdk-core";
import { WalletSetup } from "@/components/wallet/WalletSetup";

const celoSepolia: Chain = {
  id: 11142220,
  name: "Celo Sepolia",
  network: "celo-sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    public: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "CeloScan", url: "https://celoscan.io" },
  },
  testnet: true,
};

export function PrivyProvider({ appId, children }: { appId: string; children: React.ReactNode }) {
  return (
    <Privy
      appId={appId}
      config={{
        supportedChains: [celoSepolia],
        defaultChain: celoSepolia,
      }}
    >
      {children}
      <WalletSetup />
    </Privy>
  );
}
