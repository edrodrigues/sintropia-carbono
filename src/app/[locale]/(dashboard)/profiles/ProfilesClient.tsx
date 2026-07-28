"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cx, focusInput } from "@/lib/utils";
import { getUserTypeIcon } from "@/lib/utils/user";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  user_type: string | null;
  tokenBalance?: number;
  created_at: string | null;
}

interface ProfilesClientProps {
  profiles: Profile[];
  postCountByUser: Record<string, number>;
  commentCountByUser: Record<string, number>;
}

export function ProfilesClient({
  profiles,
  postCountByUser,
  commentCountByUser,
}: ProfilesClientProps) {
  const t = useTranslations("Community.profiles");
  const [selectedType, setSelectedType] = useState("");

  const filteredProfiles = selectedType
    ? profiles.filter(p => p.user_type === selectedType)
    : profiles;

  const getBadge = (tokenBalance: number) => {
    if (tokenBalance >= 1000) return { emoji: "👑", label: t("badges.master") };
    if (tokenBalance >= 500) return { emoji: "💎", label: t("badges.specialist") };
    if (tokenBalance >= 100) return { emoji: "🌟", label: t("badges.contributor") };
    if (tokenBalance >= 50) return { emoji: "🌿", label: t("badges.learner") };
    if (tokenBalance >= 10) return { emoji: "🌱", label: t("badges.beginner") };
    return { emoji: "🥚", label: t("badges.newbie") };
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "company": return `🏢 ${t("userTypes.company")}`;
      case "ong": return `🤝 ${t("userTypes.ong")}`;
      case "government": return `🏛️ ${t("userTypes.government")}`;
      case "professor": return `🧑🏫 ${t("userTypes.professor")}`;
      case "broker": return `📈 ${t("userTypes.broker")}`;
      default: return `👤 ${t("userTypes.individual")}`;
    }
  };

  const userTypes = [
    { value: "individual", label: `👤 ${t("userTypes.individual")}` },
    { value: "company", label: `🏢 ${t("userTypes.company")}` },
    { value: "ong", label: `🤝 ${t("userTypes.ong")}` },
    { value: "government", label: `🏛️ ${t("userTypes.government")}` },
    { value: "professor", label: `🧑‍🏫 ${t("userTypes.professor")}` },
    { value: "broker", label: `📈 ${t("userTypes.broker")}` },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-deep-forest mb-2 dark:text-electric-emerald">
          {t("title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("explore")}
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="user-type-filter" className="sr-only">
          {t("filterByType")}
        </label>
        <select
          id="user-type-filter"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className={cx(
            "px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
            focusInput,
          )}
          aria-label={t("filterByType")}
        >
          <option value="">{t("allTypes")}</option>
          {userTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.length > 0
          ? (
              filteredProfiles.map((profile) => {
                const badge = getBadge(profile.tokenBalance ?? 0);
                const posts = postCountByUser[profile.id] || 0;
                const comments = commentCountByUser[profile.id] || 0;

                return (
                  <div
                    key={profile.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                  >
                    <Link href={`/u/${profile.username}`} className="block p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/10 flex-shrink-0">
                          <div className="w-full h-full rounded-[0.9rem] bg-white dark:bg-gray-900 flex items-center justify-center text-3xl overflow-hidden">
                            {getUserTypeIcon(profile.user_type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">
                            {profile.display_name || profile.username || "Usuário"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            @
                            {profile.username || t("noUsername")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">{badge.emoji}</span>
                            <span className="text-xs text-gray-500">{badge.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="min-h-[3rem] mb-4">
                        {profile.bio
                          ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {profile.bio}
                              </p>
                            )
                          : (
                              <div className="h-full"></div>
                            )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {getUserTypeLabel(profile.user_type || "individual")}
                        </span>
                        <span className="font-bold text-yellow-600">
                          ⭐
                          {" "}
                          {profile.tokenBalance?.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{posts}</div>
                          <div className="text-xs text-gray-500">{t("posts")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{comments}</div>
                          <div className="text-xs text-gray-500">{t("comments")}</div>
                        </div>
                      </div>
                    </Link>

                    <div className="px-6 pb-4">
                      <Link
                        href={`/feed?author=${profile.username}`}
                        className="block w-full text-center py-2 px-4 bg-mint-tint dark:bg-blue-900/20 text-blue-600 dark:text-electric-emerald rounded-xl text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        {t("viewActivities")}
                      </Link>
                    </div>
                  </div>
                );
              })
            )
          : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4 opacity-30">👥</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">{t("noProfiles")}</h3>
                <p className="text-gray-500">{t("beFirstProfile")}</p>
              </div>
            )}
      </div>

      {!selectedType && profiles.length >= 50 && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">{t("showTop")}</p>
        </div>
      )}
    </>
  );
}
