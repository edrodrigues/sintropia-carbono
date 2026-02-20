"use client";

import { useState, useEffect } from "react";
import { WeeklyMission } from "@/types/gamification";
import { claimMissionReward, getMissionDefinition } from "@/lib/missions";
import { Tooltip } from "@/components/ui/Tooltip";

interface WeeklyMissionsProps {
  missions: WeeklyMission[];
  onClaim?: () => void;
}

export function WeeklyMissions({ missions, onClaim }: WeeklyMissionsProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [localMissions, setLocalMissions] = useState(missions);
  
  useEffect(() => {
    setLocalMissions(missions);
  }, [missions]);
  
  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    
    try {
      const result = await claimMissionReward(missionId);
      
      if (result.success) {
        setLocalMissions(prev => 
          prev.map(m => m.id === missionId ? { ...m, claimed: true } : m)
        );
        onClaim?.();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingId(null);
    }
  };
  
  const totalKarma = localMissions.reduce((sum, m) => sum + m.karma_reward, 0);
  const earnedKarma = localMissions.filter(m => m.claimed).reduce((sum, m) => sum + m.karma_reward, 0);
  const pendingKarma = localMissions.filter(m => m.completed && !m.claimed).reduce((sum, m) => sum + m.karma_reward, 0);
  const completedCount = localMissions.filter(m => m.completed).length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-gray-900 dark:text-white">Missões da Semana</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {completedCount}/{localMissions.length} completas
            </span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400 font-bold">+{earnedKarma}</span>
            <span className="text-gray-500 dark:text-gray-400">ganho</span>
          </div>
          {pendingKarma > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">+{pendingKarma}</span>
              <span className="text-gray-500 dark:text-gray-400">pendente</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-300 font-bold">~{totalKarma}</span>
            <span className="text-gray-500 dark:text-gray-400">possível</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {localMissions.map((mission) => {
          const definition = getMissionDefinition(mission.mission_type);
          const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
          const canClaim = mission.completed && !mission.claimed;
          const isClaiming = claimingId === mission.id;
          
          return (
            <div 
              key={mission.id}
              className={`p-4 transition-colors ${
                mission.claimed 
                  ? 'bg-green-50/50 dark:bg-green-900/10' 
                  : canClaim 
                    ? 'bg-yellow-50/50 dark:bg-yellow-900/10' 
                    : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                  ${mission.claimed 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : canClaim 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {mission.claimed ? '✅' : definition?.icon || '🎯'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-sm ${
                      mission.claimed 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {definition?.label || mission.mission_type}
                    </span>
                    <Tooltip content={`${mission.karma_reward} pontos de karma`}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        mission.claimed 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        +{mission.karma_reward}
                      </span>
                    </Tooltip>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {definition?.description || `Complete ${mission.target} ${mission.mission_type}`}
                  </p>
                  
                  {!mission.claimed && (
                    <div className="w-full">
                      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{mission.progress}/{mission.target}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            canClaim 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {mission.claimed && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Recompensa coletada!
                    </div>
                  )}
                </div>
                
                {canClaim && (
                  <button
                    onClick={() => handleClaim(mission.id)}
                    disabled={isClaiming}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                      ${isClaiming 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg shadow-orange-500/20'
                      }`}
                  >
                    {isClaiming ? '...' : 'Coletar'}
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

interface MissionProgressProps {
  missions: WeeklyMission[];
}

export function MissionProgress({ missions }: MissionProgressProps) {
  const completed = missions.filter(m => m.completed).length;
  const total = missions.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {completed}/{total}
      </span>
    </div>
  );
}
