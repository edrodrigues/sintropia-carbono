import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HeroTitle } from "@/components/home/HeroTitle";
import { CommunityFeed } from "@/components/home/CommunityFeed";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tIndex = await getTranslations({ locale, namespace: "Index" });

  const categories = [
    { title: tIndex("categories.items.carbonBrazil"), bgImg: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop", active: true, href: "/carbono/ranking-brasil" },
    { title: tIndex("categories.items.energyBrazil"), bgImg: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop", href: "/energia/ranking-brasil" },
    { title: tIndex("categories.items.carbonWorld"), bgImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop", href: "/carbono/ranking-mundo" },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="w-full" tabIndex={-1}>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 lg:pt-24 pb-12 lg:pb-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-electric-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">{tIndex("hero.badge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-deep-forest leading-[1.2] sm:leading-[1.15]">
              <HeroTitle title={tIndex("title")} locale={locale} />
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              {tIndex("hero.promo")}
            </p>
            <div className="flex items-center gap-4 lg:gap-6 pt-2 lg:pt-4">
              <Link
                href="/register"
                className="bg-deep-forest hover:bg-emerald-900 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold shadow-premium transition-all active:scale-95 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm lg:text-base"
              >
                {tIndex("hero.cta")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link
                href="/feed"
                className="text-slate-700 hover:text-deep-forest font-bold text-sm lg:text-base flex items-center gap-2 border-b-2 border-transparent hover:border-deep-forest transition-all"
              >
                {tIndex("hero.secondaryCta")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-premium-lg border border-slate-100 p-4 transform rotate-1 hover:rotate-0 transition-all duration-700 overflow-hidden">
              <Image
                src="/images/social-network-hero.jpg"
                alt="Rede social que conecta profissionais, empresas, dados e conhecimento aberto"
                width={560}
                height={400}
                className="w-full h-auto rounded-xl object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Community Feed Section */}
        <section className="bg-slate-50 border-y border-slate-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <CommunityFeed />
            <div className="text-center mt-10">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 text-deep-forest font-bold border-b-2 border-deep-forest pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-colors"
              >
                {tIndex("feed.viewAll")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection locale={locale} />

        {/* Explore Categories Section */}
        <section className="bg-slate-50 border-y border-slate-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-deep-forest mb-2 lg:mb-3">{tIndex("categories.title")}</h2>
                <p className="text-slate-500 text-sm">{tIndex("categories.subtitle")}</p>
              </div>
              <Link href="/categorias" className="text-slate-900 font-bold text-sm flex items-center gap-2 border-b border-slate-900 pb-1 hover:text-deep-forest hover:border-deep-forest transition-colors">
                {tIndex("categories.viewAll")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
              {categories.map((c, i) => (
                <Link key={i} href={c.href || "#"} className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer block shadow-premium hover:shadow-premium-lg transition-all">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${c.bgImg}')` }}
                    role="img"
                    aria-label={`Imagem de fundo para ${c.title}`}
                  >
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
                    {c.active && (
                      <span className="w-fit bg-electric-emerald text-[10px] uppercase font-black text-white px-2.5 py-1 rounded tracking-widest shadow-md">{tIndex("categories.trending")}</span>
                    )}
                    <h4 className="text-white text-lg font-bold leading-tight drop-shadow-md">{c.title}</h4>
                    <div className="w-full py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-bold group-hover:bg-white/20 transition-all text-center">{tIndex("categories.explore")}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Bottom */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-deep-forest mb-6">{tIndex("hero.ctaTitle") || "Pronto para começar?"}</h2>
          <p className="text-slate-600 mb-10 max-w-2xl mx-auto">{tIndex("hero.ctaDesc") || "Junte-se a centenas de empresas e especialistas que já estão moldando o futuro do mercado de carbono e energia renovável."}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-deep-forest text-white px-10 py-4 rounded-xl font-bold shadow-premium hover:bg-emerald-900 transition-all">
              {tIndex("hero.cta")}
            </Link>
            <Link href="/energia/ranking-brasil" className="bg-white border-2 border-slate-100 px-10 py-4 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-all">
              {tIndex("categories.viewRankings") || "Ver Rankings"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
