import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsDashboard } from "@/components/profile/StatsDashboard";
import { calculateAchievements } from "@/lib/achievements";
import type { Database } from "@/types/supabase";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocalizedAlternates } from "@/lib/seo";

type Post = Database["public"]["Tables"]["posts"]["Row"];

interface PageProps {
  params: Promise<{ locale: string; username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, username } = await params;

  const fallbackTitle =
    locale === "pt"
      ? `${username} | Sintropia`
      : locale === "es"
        ? `${username} | Sintropia`
        : `${username} | Sintropia`;

  const alternates = getLocalizedAlternates(locale, `/u/${username}`);

  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, headline, bio, organization, role")
      .eq("username", username)
      .maybeSingle();

    if (!profile || profile.role === "banned") {
      notFound();
    }

    const name = profile.display_name || username;
    const headline = profile.headline || "";
    const org = profile.organization || "";
    const bio = profile.bio || "";

    const title =
      locale === "pt"
        ? `${name}${headline ? ` — ${headline}` : ""} | Sintropia`
        : locale === "es"
          ? `${name}${headline ? ` — ${headline}` : ""} | Sintropia`
          : `${name}${headline ? ` — ${headline}` : ""} | Sintropia`;

    const description =
      locale === "pt"
        ? `${name}${org ? ` em ${org}` : ""}. ${headline}${bio ? `. ${bio.slice(0, 120)}` : ""} — Perfil na rede profissional de mercados ambientais e sustentabilidade.`
        : locale === "es"
          ? `${name}${org ? ` en ${org}` : ""}. ${headline}${bio ? `. ${bio.slice(0, 120)}` : ""} — Perfil en la red profesional de mercados ambientales y sostenibilidad.`
          : `${name}${org ? ` at ${org}` : ""}. ${headline}${bio ? `. ${bio.slice(0, 120)}` : ""} — Profile on the professional network for environmental markets and sustainability.`;

    const keywords =
      locale === "pt"
        ? [name, headline, org, "mercados ambientais", "sustentabilidade", "carbono", "ESG"]
        : [name, headline, org, "environmental markets", "sustainability", "carbon", "ESG"];

    return {
      title,
      description,
      keywords,
      alternates,
      openGraph: {
        title,
        description,
        url: alternates.canonical,
        siteName: "Sintropia",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description:
        locale === "pt"
          ? "Perfil profissional na rede Sintropia para mercados ambientais e sustentabilidade."
          : locale === "es"
            ? "Perfil profesional en la red Sintropia para mercados ambientales y sostenibilidad."
            : "Professional profile on Sintropia for environmental markets and sustainability.",
      alternates,
      robots: { index: true, follow: true },
    };
  }
}

export default async function PublicProfilePage(props: PageProps) {
  try {
    const params = await props.params;
    const { locale, username } = params;
    const t = await getTranslations({ locale, namespace: "Perfil" });
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      supabase = null;
    }

    let currentUser;
    try {
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      currentUser = user;
    } catch {
      currentUser = null;
    }

    let profile;
    try {
      const { data } = supabase
        ? await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle()
        : { data: null };
      profile = data;
    } catch {
      profile = null;
    }

    if (!profile || profile.role === "banned") {
      notFound();
    }

    const isOwnProfile = currentUser?.id === profile.id;

    let posts: Post[] = [];
    try {
      const { data } = supabase
        ? await supabase
          .from("posts")
          .select("*")
          .eq("author_id", profile.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(10)
        : { data: null };
      posts = (data as Post[]) || [];
    } catch {
      posts = [];
    }

    const emptyCount = { count: 0 };
    const [postCountRes, commentCountRes, upvotesRes, rankingRes] = await Promise.all([
      supabase
        ? supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile.id).eq("is_deleted", false)
        : emptyCount,
      supabase
        ? supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", profile.id).eq("is_deleted", false)
        : emptyCount,
      supabase
        ? supabase.from("votes").select("id", { count: "exact", head: true }).in("target_id", posts.map(p => p.id).length > 0 ? posts.map(p => p.id) : [""]).eq("vote_type", 1)
        : emptyCount,
      supabase
        ? supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "banned").gt("karma", profile.karma ?? 0)
        : emptyCount,
    ]);

    const stats = {
      posts: postCountRes.count || 0,
      comments: commentCountRes.count || 0,
      upvotes: upvotesRes.count || 0,
      ranking: rankingRes.count !== null ? rankingRes.count + 1 : 1,
    };

    const achievements = calculateAchievements({
      karma: profile.karma ?? undefined,
      linkedin_url: profile.linkedin_url ?? undefined,
      created_at: profile.created_at ?? undefined,
    }, {
      postCount: stats.posts,
      commentCount: stats.comments,
      upvotesReceived: stats.upvotes,
      hasLinkedIn: !!profile.linkedin_url,
      createdAt: profile.created_at ?? new Date().toISOString(),
    });

    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
          <Breadcrumb />

          <ProfileHeader profile={profile!} achievements={achievements} isOwnProfile={isOwnProfile} />

          <StatsDashboard stats={stats} />

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("myPosts")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts && posts.length > 0
                ? (
                    posts.map(post => (
                      <Link
                        key={post.id}
                        href={`/feed?post=${post.id}`}
                        className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 uppercase">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString(locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US") : ""}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {post.title}
                        </h3>
                        {post.content && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                            {post.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            ⬆
                            {post.karma}
                          </span>
                          <span>
                            💬
                            {post.comment_count}
                          </span>
                        </div>
                      </Link>
                    ))
                  )
                : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      {t("noPosts")}
                    </div>
                  )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (err) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h1 style={{ color: "red" }}>Error rendering profile page</h1>
        <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", overflow: "auto" }}>
          {err instanceof Error
            ? `${err.message}\n\n${err.stack}`
            : String(err)}
        </pre>
      </div>
    );
  }
}
