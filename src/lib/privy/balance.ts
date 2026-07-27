const RPC_URL = "https://forno.celo-sepolia.celo-testnet.org";
const TOKEN_ADDRESS = "0x57c5902cff77cde800e784456f42af09bb390256";

function padAddress(address: string): string {
  return "000000000000000000000000" + address.replace("0x", "").toLowerCase();
}

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

async function fetchDecimals(): Promise<number> {
  const result = await rpcCall("eth_call", [
    { to: TOKEN_ADDRESS, data: "0x313ce567" },
    "latest",
  ]);
  return parseInt(result, 16);
}

async function fetchSymbol(): Promise<string> {
  const result = await rpcCall("eth_call", [
    { to: TOKEN_ADDRESS, data: "0x95d89b41" },
    "latest",
  ]);
  let symbol = "";
  for (let i = 0; i < result.length; i += 64) {
    const chunk = result.slice(i + 2, i + 64);
    const chars =
      chunk
        .match(/.{1,2}/g)
        ?.map((b: string) => String.fromCharCode(parseInt(b, 16)))
        .join("") || "";
    symbol += chars.replace(/\0/g, "");
  }
  return symbol.trim();
}

function parseBalance(hex: string, decimals: number): number {
  const raw = BigInt(hex);
  const divisor = BigInt(10) ** BigInt(decimals);
  const intPart = raw / divisor;
  const decPart = raw % divisor;
  if (decPart === BigInt(0)) return Number(intPart);
  return Number(intPart) + Number(decPart) / Number(divisor);
}

export interface TokenBalanceResult {
  address: string;
  balance: number;
}

export async function fetchTokenBalances(
  addresses: string[]
): Promise<TokenBalanceResult[]> {
  if (addresses.length === 0) return [];

  const valid = addresses.filter((a) => a && a.startsWith("0x"));
  if (valid.length === 0) return [];

  const decimals = await fetchDecimals();

  const results = await Promise.all(
    valid.map(async (address) => {
      try {
        const hex = await rpcCall("eth_call", [
          { to: TOKEN_ADDRESS, data: "0x70a08231" + padAddress(address) },
          "latest",
        ]);
        return { address, balance: parseBalance(hex, decimals) };
      } catch {
        return { address, balance: 0 };
      }
    })
  );

  return results.sort((a, b) => b.balance - a.balance);
}

export async function fetchTokenInfo(): Promise<{
  symbol: string;
  decimals: number;
}> {
  const [symbol, decimals] = await Promise.all([
    fetchSymbol(),
    fetchDecimals(),
  ]);
  return { symbol, decimals };
}

export async function fetchUserTokenBalance(
  walletAddress: string | null
): Promise<number> {
  if (!walletAddress || !walletAddress.startsWith("0x")) return 0;
  const results = await fetchTokenBalances([walletAddress]);
  return results[0]?.balance ?? 0;
}

export async function fetchBalancesByWallet(
  profiles: { wallet_address: string | null; id?: string }[]
): Promise<Map<string, number>> {
  const wallets = profiles
    .map((p) => p.wallet_address)
    .filter(Boolean) as string[];

  const results = await fetchTokenBalances(wallets);
  const map = new Map<string, number>();
  for (const r of results) {
    map.set(r.address.toLowerCase(), r.balance);
  }
  return map;
}

export function getBalanceFromMap(
  balanceMap: Map<string, number>,
  walletAddress: string | null
): number {
  if (!walletAddress) return 0;
  return balanceMap.get(walletAddress.toLowerCase()) ?? 0;
}
