import { NextResponse } from "next/server";
import { createPrivyWallet } from "@/lib/privy/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const wallet = await createPrivyWallet();

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ wallet_address: wallet.address })
      .eq("id", userId);

    if (error) {
      console.error("Failed to store wallet address:", error);
      return NextResponse.json({ error: "Failed to store wallet address" }, { status: 500 });
    }

    return NextResponse.json({ address: wallet.address, id: wallet.id });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
  }
}
