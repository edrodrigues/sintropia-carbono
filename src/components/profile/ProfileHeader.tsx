"use client";

import Link from "next/link";
import Image from "next/image";
import { ProgressBar } from "./ProgressBar";
import { AchievementBadges, type Achievement } from "./AchievementBadges";
import { getUserTypeIcon } from "@/lib/utils/user";
import { useTranslations } from "next-intl";

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    display_name?: string | null;
    bio?: string | null;
    karma?: number | null;
    tokenBalance?: number | null;
    organization?: string | null;
    cargo?: string | null;
    linkedin_url?: string | null;
    twitter_url?: string | null;
    avatar_url?: string | null;
    user_type?: string | null;
    created_at?: string | null;
    headline?: string | null;
    expertise_areas?: string[] | null;
    certifications?: string[] | null;
    years_of_experience?: number | null;
    available_for_consulting?: boolean | null;
    company_tagline?: string | null;
    company_sector?: string | null;
    company_size?: string | null;
    company_cnpj?: string | null;
    company_website?: string | null;
    company_founded_year?: number | null;
    company_geo_presence?: string | null;
  };
  achievements?: Achievement[];
  isOwnProfile?: boolean;
}

const getBadge = (tokenBalance: number) => {
  if (tokenBalance >= 1000) return { emoji: "👑", label: "Master", nextLevel: 2000, color: "yellow" };
  if (tokenBalance >= 500) return { emoji: "💎", label: "Especialista", nextLevel: 1000, color: "blue" };
  if (tokenBalance >= 100) return { emoji: "🌟", label: "Contribuidor", nextLevel: 500, color: "green" };
  if (tokenBalance >= 50) return { emoji: "🌿", label: "Aprendiz", nextLevel: 100, color: "teal" };
  if (tokenBalance >= 10) return { emoji: "🌱", label: "Iniciante", nextLevel: 50, color: "emerald" };
  return { emoji: "🥚", label: "Novato", nextLevel: 10, color: "gray" };
};

export function ProfileHeader({ profile, achievements, isOwnProfile = false }: ProfileHeaderProps) {
  const t = useTranslations("ProfileHeader");
  const tPerfil = useTranslations("Perfil");
  const tokenBalance = profile.tokenBalance ?? profile.karma ?? 0;
  const badge = getBadge(tokenBalance);

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[3px] shadow-2xl flex-shrink-0">
            <div className="w-full h-full rounded-[1.6rem] bg-white dark:bg-gray-900 flex items-center justify-center text-6xl font-bold text-blue-600 overflow-hidden relative">
              {profile.avatar_url
                ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      fill
                      className="object-cover"
                    />
                  )
                : (
                    getUserTypeIcon(profile.user_type)
                  )}
            </div>
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
            <p className="text-blue-100 mb-1">
              @
              {profile.username}
            </p>

            {profile.headline && (
              <p className="text-blue-200 text-sm font-medium mb-2">{profile.headline}</p>
            )}

            {profile.bio && (
              <p className="text-blue-50 mb-3 max-w-xl">{profile.bio}</p>
            )}

            <div className="mt-4 max-w-md">
              <ProgressBar
                current={tokenBalance}
                max={badge.nextLevel}
                label={t("progressLabel")}
              />
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-6 py-3 bg-white hover:bg-gray-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {tPerfil("editProfile")}
            </Link>
          )}
        </div>

        {(profile.organization || profile.linkedin_url || profile.twitter_url) && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap items-center gap-4">
              {profile.organization && (
                <span className="text-blue-100 text-sm">
                  🏢
                  {" "}
                  {profile.organization}
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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

      {profile.user_type === "company" ? (
        <div className="mb-4 space-y-4">
          {profile.company_tagline && (
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">{profile.company_tagline}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {profile.company_sector && (
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                {profile.company_sector}
              </span>
            )}
            {profile.company_size && (
              <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
                {profile.company_size}
              </span>
            )}
            {profile.company_geo_presence && (
              <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-medium border border-teal-200 dark:border-teal-800">
                {profile.company_geo_presence}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {profile.company_cnpj && <span>📋 CNPJ: {profile.company_cnpj}</span>}
            {profile.company_website && (
              <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-premium-blue hover:underline">
                🌐 {profile.company_website}
              </a>
            )}
            {profile.company_founded_year != null && <span>📅 Fundada em {profile.company_founded_year}</span>}
          </div>
        </div>
      ) : (
        <>
          {profile.expertise_areas && profile.expertise_areas.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Áreas de Especialização</h3>
              <div className="flex flex-wrap gap-2">
                {profile.expertise_areas.map(area => (
                  <span key={area} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Certificações</h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map(cert => (
                  <span key={cert} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {profile.years_of_experience != null && (
              <span>📅 {profile.years_of_experience} anos de experiência</span>
            )}
            {profile.available_for_consulting && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                ✅ Disponível para consultoria
              </span>
            )}
          </div>
        </>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {tPerfil("achievements")}
        </h3>
        <AchievementBadges achievements={achievements || []} />
      </div>
    </div>
  );
}
