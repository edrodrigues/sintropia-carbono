"use client";

import Link from "next/link";
import Image from "next/image";
import { ProgressBar } from "./ProgressBar";
import { AchievementBadges, type Achievement } from "./AchievementBadges";

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    display_name?: string;
    bio?: string;
    karma?: number;
    organization?: string;
    cargo?: string;
    linkedin_url?: string;
    twitter_url?: string;
    avatar_url?: string;
    created_at?: string;
  };
  achievements?: Achievement[];
  isOwnProfile?: boolean;
}

const getBadge = (karma: number) => {
  if (karma >= 1000) return { emoji: "👑", label: "Master", nextLevel: 2000, color: "yellow" };
  if (karma >= 500) return { emoji: "💎", label: "Especialista", nextLevel: 1000, color: "blue" };
  if (karma >= 100) return { emoji: "🌟", label: "Contribuidor", nextLevel: 500, color: "green" };
  if (karma >= 10) return { emoji: "🌱", label: "Iniciante", nextLevel: 100, color: "emerald" };
  return { emoji: "🥚", label: "Novato", nextLevel: 10, color: "gray" };
};

export function ProfileHeader({ profile, achievements, isOwnProfile = false }: ProfileHeaderProps) {
  const karma = profile.karma || 0;
  const badge = getBadge(karma);

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 rounded-full bg-white border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center text-4xl font-bold text-blue-600 overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              (profile.display_name?.[0] || profile.username?.[0] || "?").toUpperCase()
            )}
          </div>
          
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                <span>{badge.emoji}</span>
                <span>{badge.label}</span>
              </span>
            </div>
            <p className="text-blue-100 mb-2">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-blue-50 mb-3 max-w-xl">{profile.bio}</p>
            )}
            
            <div className="mt-4 max-w-md">
              <ProgressBar
                current={karma}
                max={badge.nextLevel}
                label={`Progresso para próximo nível`}
              />
            </div>
          </div>
          
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors"
            >
              Editar Perfil
            </Link>
          )}
        </div>
        
        {(profile.organization || profile.linkedin_url || profile.twitter_url) && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap items-center gap-4">
              {profile.organization && (
                <span className="text-blue-100 text-sm">
                  🏢 {profile.organization}
                  {profile.cargo && ` - ${profile.cargo}`}
                </span>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-100 hover:text-white text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-100 hover:text-white text-sm"
                >
                  𝕏
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Conquistas
        </h3>
        <AchievementBadges achievements={achievements || []} />
      </div>
    </div>
  );
}
