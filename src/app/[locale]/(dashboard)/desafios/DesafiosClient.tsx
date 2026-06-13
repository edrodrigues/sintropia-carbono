"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { CreateChallengeButton } from "@/components/challenges/CreateChallengeButton";
import { ChallengeDetailModal } from "@/components/challenges/ChallengeDetailModal";
import { ChallengeWithRelations, CHALLENGE_CATEGORIES } from "@/types";
import { User } from "@supabase/supabase-js";

export default function DesafiosClient({ initialChallenges }: { initialChallenges: ChallengeWithRelations[] }) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithRelations | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);

  const refreshChallenges = useCallback(async () => {
    let query = supabase
      .from("challenges")
      .select(`*, author:profiles!inner(username, avatar_url, display_name, karma, user_type, company_tagline, company_sector)`)
      .eq("is_deleted", false)
      .neq("author.role", "banned")
      .order("created_at", { ascending: false })
      .limit(20);

    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter);
    }

    const { data } = await query;
    if (data) setChallenges(data as ChallengeWithRelations[]);
  }, [categoryFilter, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshChallenges();
  }, [categoryFilter, refreshChallenges]);

  const handleChallengeUpdated = (updated: ChallengeWithRelations) => {
    setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedChallenge(updated);
  };

  const filteredChallenges = categoryFilter === "all"
    ? challenges
    : challenges.filter(c => c.category === categoryFilter);

  return (
    <div className="container mx-auto max-w-5xl px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Desafios ESG</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organizações compartilham desafios ESG reais. Contribua com suas ideias e soluções.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Todos
          </button>
          {CHALLENGE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <CreateChallengeButton onChallengeCreated={refreshChallenges} />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {filteredChallenges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onOpenDetail={setSelectedChallenge}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="text-5xl mb-4">🏔️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum desafio encontrado
              </h3>
              <p className="text-gray-500">
                {categoryFilter !== "all" ? "Nenhum desafio nesta categoria ainda." : "Seja o primeiro a compartilhar um desafio ESG!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          currentUser={currentUser}
          onChallengeUpdated={handleChallengeUpdated}
        />
      )}
    </div>
  );
}
