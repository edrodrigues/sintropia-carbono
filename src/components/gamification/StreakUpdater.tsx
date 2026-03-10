"use client";

import { useEffect, useState } from "react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  bonus_earned: number;
}

export function StreakUpdater({ children }: { children: React.ReactNode }) {
  const [hasUpdated, setHasUpdated] = useState(false);

  useEffect(() => {
    if (hasUpdated) return;

    const updateStreak = async () => {
      try {
        // First check if already updated today to be efficient
        const checkRes = await fetch("/api/gamification/streak");
        if (checkRes.ok) {
          const { streak } = await checkRes.json();
          const today = new Date().toISOString().split("T")[0];
          
          if (streak?.last_activity_date === today) {
            console.log("Streak already updated today");
            setHasUpdated(true);
            return;
          }
        }

        const res = await fetch("/api/gamification/streak", {
          method: "POST",
        });
        
        if (res.ok) {
          const data: StreakData = await res.json();
          console.log("Streak updated:", data);
          
          if (data.bonus_earned > 0) {
            window.dispatchEvent(new CustomEvent("streak-updated", { detail: data }));
          }
        }
      } catch (error) {
        console.error("Failed to update streak:", error);
      } finally {
        setHasUpdated(true);
      }
    };

    updateStreak();
  }, [hasUpdated]);

  return <>{children}</>;
}
