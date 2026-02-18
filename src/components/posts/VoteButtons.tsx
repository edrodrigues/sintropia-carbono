"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VoteButtonsProps {
    targetId: string;
    targetType: "post" | "comment";
    initialKarma: number;
}

export function VoteButtons({
    targetId,
    targetType,
    initialKarma,
}: VoteButtonsProps) {
    const [karma, setKarma] = useState(initialKarma);
    const [userVote, setUserVote] = useState<number>(0);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUserVote = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("votes")
                .select("vote_type")
                .eq("user_id", user.id)
                .eq("target_id", targetId)
                .eq("target_type", targetType)
                .single();

            if (data) {
                setUserVote(data.vote_type);
            }
        };

        fetchUserVote();
    }, [targetId, targetType, supabase]);

    const handleVote = async (type: number) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        const newVoteType = userVote === type ? 0 : type;
        const karmaDiff = newVoteType - userVote;

        // Optimistic update
        setKarma((prev) => prev + karmaDiff);
        setUserVote(newVoteType);

        if (newVoteType === 0) {
            // Delete vote
            await supabase
                .from("votes")
                .delete()
                .eq("user_id", user.id)
                .eq("target_id", targetId)
                .eq("target_type", targetType);
        } else {
            // Upsert vote
            await supabase.from("votes").upsert({
                user_id: user.id,
                target_id: targetId,
                target_type: targetType,
                vote_type: newVoteType,
            });
        }

        // Update target karma in database (best handled by RPC or Trigger, but implementation plan suggests manual logic for now or implies trigger)
        // The implementation plan Fase 6 has triggers for karma.
        router.refresh();
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                onClick={() => handleVote(1)}
                className={`p-1 rounded-lg transition-colors ${userVote === 1
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </button>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {karma}
            </span>
            <button
                onClick={() => handleVote(-1)}
                className={`p-1 rounded-lg transition-colors ${userVote === -1
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
        </div>
    );
}
