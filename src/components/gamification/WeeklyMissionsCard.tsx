"use client";

import { useState } from "react";
import { getMissionDefinition } from "@/lib/missions";
import type { WeeklyMission } from "@/types/gamification";

interface WeeklyMissionsCardProps {
    initialMissions: WeeklyMission[];
}

export function WeeklyMissionsCard({ initialMissions }: WeeklyMissionsCardProps) {
    const [missions, setMissions] = useState<WeeklyMission[]>(initialMissions);
    const [claiming, setClaiming] = useState<string | null>(null);

    const handleClaim = async (missionId: string) => {
        setClaiming(missionId);
        try {
            const res = await fetch("/api/gamification/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ missionId }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Update the specific mission to claimed in local state
                    setMissions((prev) =>
                        prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
                    );
                    // Dispatch event to update karma globally if needed
                    window.dispatchEvent(
                        new CustomEvent("karma-earned", { detail: { amount: data.karma_earned } })
                    );
                }
            }
        } catch (error) {
            console.error("Failed to claim mission:", error);
        } finally {
            setClaiming(null);
        }
    };

    const totalKarmaPossible = missions.reduce((sum, m) => sum + m.karma_reward, 0);
    const karmaEarned = missions.filter(m => m.claimed).reduce((sum, m) => sum + m.karma_reward, 0);

    if (!missions || missions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Missões da Semana</h3>
                </div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {karmaEarned} / {totalKarmaPossible} Karma ganho
                </div>
            </div>

            <div className="space-y-4">
                {missions.map((mission) => {
                    const def = getMissionDefinition(mission.mission_type);
                    const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
                    const isCompleted = mission.progress >= mission.target;

                    return (
                        <div
                            key={mission.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all ${mission.claimed
                                    ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75"
                                    : isCompleted
                                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${mission.claimed
                                            ? "bg-gray-200 dark:bg-gray-700"
                                            : "bg-blue-100 dark:bg-blue-900/30"
                                        }`}
                                >
                                    {def.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                            {def.label}
                                        </h4>
                                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                            +{mission.karma_reward} karma
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{def.description}</p>

                                    {/* ProgressBar */}
                                    <div className="mt-2 text-xs flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isCompleted
                                                        ? "bg-emerald-500 dark:bg-emerald-400"
                                                        : "bg-blue-500 dark:bg-blue-400"
                                                    }`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 w-10 text-right">
                                            {mission.progress}/{mission.target}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                                {mission.claimed ? (
                                    <button
                                        disabled
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-bold rounded-xl cursor-not-allowed"
                                    >
                                        Resgatado
                                    </button>
                                ) : isCompleted ? (
                                    <button
                                        onClick={() => handleClaim(mission.id)}
                                        disabled={claiming === mission.id}
                                        className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {claiming === mission.id ? "Resgatando..." : "Resgatar"}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed"
                                    >
                                        Em progresso
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
