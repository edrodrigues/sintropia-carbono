"use client";

import { useEffect, useRef } from "react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  bonus_earned: number;
  streak_reset?: boolean;
}

export function StreakUpdater({ children }: { children: React.ReactNode }) {
  // Use ref instead of state to prevent re-renders and race conditions
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasUpdatedRef.current) return;
    hasUpdatedRef.current = true;

    const updateStreak = async () => {
      try {
        // First check if already updated today to be efficient
        const checkRes = await fetch("/api/gamification/streak");
        if (checkRes.ok) {
          const { streak } = await checkRes.json();
          // Use UTC date for comparison
          const today = new Date().toISOString().split("T")[0];
          
          if (streak?.last_activity_date === today) {
            console.log("Streak already updated today");
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
          
          // Dispatch event for streak reset notification
          if (data.streak_reset) {
            window.dispatchEvent(new CustomEvent("streak-reset", { detail: data }));
          }
        }
      } catch (error) {
        console.error("Failed to update streak:", error);
      }
    };

    updateStreak();
    // Empty dependency array - run only once on mount
  }, []);

  return <>{children}</>;
}
