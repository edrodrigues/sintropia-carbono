import { createClient } from "@/lib/supabase/server";
import DesafiosClient from "./DesafiosClient";
import { ChallengeWithRelations } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Desafios ESG | Sintropia",
    es: "Desafíos ESG | Sintropia",
    en: "ESG Challenges | Sintropia",
  };

  return {
    title: titles[locale] ?? titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function DesafiosPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }

  let challenges: ChallengeWithRelations[] = [];
  try {
    const { data } = supabase
      ? await supabase
        .from("challenges")
        .select(`
            *,
            author:profiles!inner(username, avatar_url, display_name, karma, user_type, company_tagline, company_sector)
          `)
        .eq("is_deleted", false)
        .neq("author.role", "banned")
        .order("created_at", { ascending: false })
        .limit(20)
      : { data: null };
    challenges = (data as ChallengeWithRelations[]) || [];
  } catch {
    challenges = [];
  }

  return <DesafiosClient initialChallenges={challenges} />;
}
