"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function WalletSetup() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    const setup = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("id", user.id)
        .single();

      if (profile?.wallet_address) return;

      const res = await fetch("/api/privy/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        console.error("Failed to create wallet");
      }
    };

    done.current = true;
    setup();
  }, []);

  return null;
}
