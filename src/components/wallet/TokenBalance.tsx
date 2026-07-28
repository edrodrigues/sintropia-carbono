"use client";

import { useEffect, useState } from "react";

const RPC_URL = "https://forno.celo-sepolia.celo-testnet.org";
const TOKEN_ADDRESS = "0x57c5902cff77cde800e784456f42af09bb390256";

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function padAddress(address: string): string {
  return "000000000000000000000000" + address.replace("0x", "").toLowerCase();
}

async function fetchDecimals(): Promise<number> {
  const data = "0x313ce567";
  const result = await rpcCall("eth_call", [{ to: TOKEN_ADDRESS, data }, "latest"]);
  return parseInt(result, 16);
}

async function fetchBalance(walletAddress: string): Promise<string> {
  const data = "0x70a08231" + padAddress(walletAddress);
  return await rpcCall("eth_call", [{ to: TOKEN_ADDRESS, data }, "latest"]);
}

async function fetchSymbol(): Promise<string> {
  const data = "0x95d89b41";
  const result = await rpcCall("eth_call", [{ to: TOKEN_ADDRESS, data }, "latest"]);
  let symbol = "";
  for (let i = 0; i < result.length; i += 64) {
    const chunk = result.slice(i + 2, i + 64);
    const chars = chunk.match(/.{1,2}/g)?.map((b: string) => String.fromCharCode(parseInt(b, 16))).join("") || "";
    symbol += chars.replace(/\0/g, "");
  }
  return symbol.trim();
}

function formatBalance(rawBalance: string, decimals: number): string {
  const hex = rawBalance.replace("0x", "") || "0";
  const value = BigInt("0x" + hex);
  const balanceStr = value.toString().padStart(decimals + 1, "0");
  const intPart = balanceStr.slice(0, balanceStr.length - decimals) || "0";
  const decPart = balanceStr.slice(balanceStr.length - decimals).replace(/0+$/, "");
  if (!decPart) return intPart;
  return `${intPart}.${decPart}`;
}

export function TokenBalance({ walletAddress }: { walletAddress: string | null }) {
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [rawBalance, decimals, sym] = await Promise.all([
          fetchBalance(walletAddress),
          fetchDecimals(),
          fetchSymbol(),
        ]);
        if (cancelled) return;
        setBalance(formatBalance(rawBalance, decimals));
        setSymbol(sym);
      } catch {
        if (!cancelled) setBalance(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Token Balance
      </h3>
      {loading
        ? <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        : balance !== null
          ? (
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {balance} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">{symbol || "Tokens"}</span>
            </p>
          )
          : (
            <p className="text-sm text-gray-500">Unable to load balance</p>
          )}
    </div>
  );
}