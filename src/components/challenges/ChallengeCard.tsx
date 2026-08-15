"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getUserTypeIcon } from "@/lib/utils/user";
import type { ChallengeWithRelations } from "@/types";

interface ChallengeCardProps {
  challenge: ChallengeWithRelations;
  onOpenDetail?: (challenge: ChallengeWithRelations) => void;
}

export function ChallengeCard({ challenge, onOpenDetail }: ChallengeCardProps) {
  const t = useTranslations("Community.challenges");
  const locale = useLocale();

  const handleClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLAnchorElement
      || e.target instanceof HTMLButtonElement
      || (e.target as HTMLElement).closest("button")
      || (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    onOpenDetail?.(challenge);
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Top badge */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
        <span className="text-white text-xs font-bold uppercase tracking-wider">{t("card.badge")}</span>
        {challenge.solution_comment_id && (
          <span className="ml-auto flex items-center gap-1 text-yellow-200 text-xs font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("card.solutionFound")}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/u/${challenge.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={e => e.stopPropagation()}>
            <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-sm flex-shrink-0">
              <div className="relative w-full h-full rounded-[0.35rem] bg-white dark:bg-gray-900 flex items-center justify-center text-base overflow-hidden">
                {challenge.author?.avatar_url
                  ? <Image src={challenge.author.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                  : <span>{getUserTypeIcon(challenge.author?.user_type)}</span>
                }
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block leading-tight">
                {challenge.author?.display_name || challenge.author?.username}
              </span>
              {challenge.author?.company_tagline && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{challenge.author.company_tagline}</span>
              )}
            </div>
          </Link>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {challenge.title}
        </h3>

        {/* Category + Sector badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg">
            {t.has(`categories.${challenge.category}`) ? t(`categories.${challenge.category}`) : challenge.category}
          </span>
          {challenge.sector && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
              {challenge.sector}
            </span>
          )}
        </div>

        {/* Context preview */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-3">
          {challenge.context}
        </p>

        {/* Reward highlight */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-3">
          <span className="text-lg">🎁</span>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300 line-clamp-1">
            {challenge.reward}
          </span>
        </div>

        {/* Images preview */}
        {challenge.images && challenge.images.length > 0 && (
          <div className="flex gap-2 mb-3">
            {challenge.images.slice(0, 3).map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t("card.ideaCount", { count: challenge.comment_count })}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date(challenge.created_at).toLocaleDateString(locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
