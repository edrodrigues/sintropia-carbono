const PRIVY_API_URL = "https://api.privy.io";

function getAuth(): string {
  const appId = process.env.NEXT_PRIVY_ID;
  const appSecret = process.env.NEXT_PRIVY_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Privy credentials not configured");
  }
  return Buffer.from(`${appId}:${appSecret}`).toString("base64");
}

export async function createPrivyWallet(): Promise<{ id: string; address: string; chain_type: string }> {
  const appId = process.env.NEXT_PRIVY_ID!;
  const auth = getAuth();
  const res = await fetch(`${PRIVY_API_URL}/v1/wallets`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "privy-app-id": appId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chain_type: "ethereum" }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create Privy wallet: ${error}`);
  }

  return res.json();
}
