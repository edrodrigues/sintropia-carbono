import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommunityFeed } from "@/components/home/CommunityFeed";
import { createClient } from "@/lib/supabase/server";
import { getUserTypeIcon } from "@/lib/utils/user";
import { getTranslations } from 'next-intl/server';
import { Link } from "@/i18n/routing";
import { HeroTitle } from "@/components/home/HeroTitle";
import Image from "next/image";
import { FAQSchema } from '@/components/seo/FAQSchema';
import { homeFAQs } from '@/lib/seo/faq-data';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tIndex = await getTranslations({ locale, namespace: 'Index' });
  const supabase = await createClient();

  // Fetch top 3 contributors
  const { data: topContributors } = await supabase
    .from("profiles")
    .select("display_name, username, karma, avatar_url, user_type")
    .neq("role", "banned")
    .order("karma", { ascending: false })
    .limit(3);

  // Fetch current user if logged in
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const features = [
    { title: tIndex('features.brazilianData.title'), desc: tIndex('features.brazilianData.desc'), icon: "📂" },
    { title: tIndex('features.marketIntelligence.title'), desc: tIndex('features.marketIntelligence.desc'), icon: "📈" },
    { title: tIndex('features.activeCommunity.title'), desc: tIndex('features.activeCommunity.desc'), icon: "🤝" },
    { title: tIndex('features.openApi.title'), desc: tIndex('features.openApi.desc'), icon: "💻" }
  ];

  const categories = [
    { title: tIndex('categories.items.carbonBrazil'), bgImg: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop", active: true, href: "/carbono/ranking-brasil" },
    { title: tIndex('categories.items.energyBrazil'), bgImg: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop", href: "/irec-brasil" },
    { title: tIndex('categories.items.carbonWorld'), bgImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop", href: "/carbono/ranking-mundo" },
    { title: tIndex('categories.items.energyPrices'), bgImg: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop", href: "/irec-precos" },
    { title: tIndex('categories.items.carbonProjects'), bgImg: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop", href: "/carbono/projetos" }
  ];

  return (
    <>
      <FAQSchema items={homeFAQs[locale as keyof typeof homeFAQs] || homeFAQs.pt} pageName="home" />
      <Header />
      <main id="main-content" className="w-full" tabIndex={-1}>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 pt-16 lg:pt-24 pb-16 lg:pb-32 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">{tIndex('hero.badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-forest-green leading-[1.2] sm:leading-[1.15]">
              <HeroTitle title={tIndex('title')} locale={locale} />
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              {tIndex('hero.promo')}
            </p>
            <div className="flex items-center gap-4 lg:gap-6 pt-2 lg:pt-4">
              <Link
                href="/register"
                className="bg-forest-green hover:bg-emerald-900 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold shadow-premium transition-all active:scale-95 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm lg:text-base"
              >
                {tIndex('hero.cta')}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="bg-white rounded-2xl shadow-premium-lg border border-slate-100 p-8 transform rotate-1 hover:rotate-0 transition-all duration-700">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{tIndex('stats.indexSREC')}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-forest-green">+12.4%</span>
                    <span className="text-xs text-emerald-500 font-medium">{tIndex('stats.vsLastMonth')}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">📊</span>
                </div>
              </div>
              <div className="h-48 w-full bg-slate-50 rounded-xl relative overflow-hidden flex items-end gap-1 px-4">
                {[45, 60, 48, 75, 55, 90, 65, 80, 70, 95, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-400/20 rounded-t-[2px] border-t border-emerald-400/40" style={{ height: `${h}%` }}></div>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
              </div>
            </div>
            {/* Floating decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-premium transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl mb-6 group-hover:bg-emerald-50 group-hover:scale-110 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-forest-green mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Explore Categories */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-12 lg:py-24">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-8 lg:mb-12">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-2 lg:mb-3">{tIndex('categories.title')}</h2>
              <p className="text-slate-500 text-sm">{tIndex('categories.subtitle')}</p>
            </div>
            <Link href="/categorias" className="text-slate-900 font-bold text-sm flex items-center gap-2 border-b border-slate-900 pb-1 hover:text-forest-green hover:border-forest-green transition-colors">
              {tIndex('categories.viewAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {categories.map((c, i) => (
              <Link key={i} href={c.href || "#"} className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer block">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url('${c.bgImg}')` }}
                  role="img"
                  aria-label={`Imagem de fundo para ${c.title}`}
                ></div>
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
                  {c.active && (
                    <span className="w-fit bg-emerald-600 text-[10px] uppercase font-black text-white px-2.5 py-1 rounded tracking-widest shadow-md">{tIndex('categories.trending')}</span>
                  )}
                  <h4 className="text-white text-lg font-bold leading-tight drop-shadow-md">{c.title}</h4>
                  <div className="w-full py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-bold hover:bg-white/20 transition-all text-center">{tIndex('categories.explore')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Community Feed */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-12 lg:py-24 flex flex-col lg:flex-row gap-8 lg:gap-12">
          <CommunityFeed />

          <aside className="flex-1 space-y-8">
            {/* Top Contributors */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-premium">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg tracking-tight uppercase">{tIndex('sidebar.topContributors')}</h3>
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </div>
              <div className="space-y-6">
                {topContributors?.map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-black font-mono text-slate-700 w-4">0{i + 1}</span>
                    <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm flex-shrink-0">
                      <div className="w-full h-full rounded-[0.65rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                        {c.avatar_url ? (
                          <Image src={c.avatar_url} alt={c.username} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{getUserTypeIcon(c.user_type)}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold flex-1 truncate">{c.display_name || c.username}</span>
                    <span className="text-[11px] font-black text-emerald-500 font-mono">{(c.karma ?? 0) > 1000 ? `${((c.karma ?? 0) / 1000).toFixed(1)}k` : c.karma ?? 0} {tIndex('stats.pts')}</span>
                  </div>
                ))}
              </div>
              <Link href="/leaderboard" className="block w-full text-center mt-10 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest">{tIndex('sidebar.viewRanking')}</Link>
            </div>

            {/* Profile Widget */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-premium">
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-400">{tIndex('sidebar.myPanel')}</h4>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-sm flex-shrink-0">
                  <div className="w-full h-full rounded-[0.6rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{getUserTypeIcon(profile?.user_type)}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{tIndex('sidebar.status')}</p>
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    {profile ? (profile.display_name || profile.username) : tIndex('sidebar.notLoggedIn')}
                  </p>
                </div>
              </div>

              {profile ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                    <span className="text-slate-500 font-medium">{tIndex('sidebar.karma')}</span>
                    <span className="font-bold text-emerald-600 font-mono">{profile.karma?.toLocaleString() || 0} {tIndex('stats.pts')}</span>
                  </div>

                  <Link href="/conquistas" className="block w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-center rounded-xl text-xs font-bold transition-all uppercase tracking-widest mt-4">{tIndex('sidebar.viewAchievements')}</Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 text-center leading-relaxed mb-8">{tIndex('sidebar.loginToFollow')}</p>
                  <Link href="/login" className="block w-full py-4 bg-forest-green text-white text-center rounded-xl text-xs font-bold shadow-premium hover:bg-emerald-900 transition-all active:scale-95 uppercase tracking-widest">{tIndex('sidebar.loginRegister')}</Link>
                </>
              )}
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
