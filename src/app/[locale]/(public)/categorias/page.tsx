import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Categorias' });
    
    return {
        title: t('title'),
        description: t('subtitle'),
        keywords: locale === "pt"
            ? ["categorias carbono", "energia renovável", "I-REC", "créditos carbono", "inteligência mercado"]
            : ["carbon categories", "renewable energy", "I-REC", "carbon credits", "market intelligence"],
        alternates: {
            canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/' }categorias`,
        },
    };
}

export default async function Categorias({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Categorias' });

    const categories = [
      {
        title: t('items.carbonBrazil'),
        description: t('items.carbonBrazilDesc'),
        image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.carbonBrazil'),
        href: "/carbono-brasil",
        active: true,
      },
      {
        title: t('items.energyBrazil'),
        description: t('items.energyBrazilDesc'),
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.energyBrazil'),
        href: "/irec-brasil",
      },
      {
        title: t('items.carbonWorld'),
        description: t('items.carbonWorldDesc'),
        image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.carbonWorld'),
        href: "/carbono-mundo",
      },
      {
        title: t('items.energyPrices'),
        description: t('items.energyPricesDesc'),
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.energyPrices'),
        href: "/irec-precos",
      },
      {
        title: t('items.carbonProjects'),
        description: t('items.carbonProjectsDesc'),
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.carbonProjects'),
        href: "/carbono-projetos",
      },
      {
        title: t('items.certificadoras'),
        description: t('items.certificadorasDesc'),
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.certificadoras'),
        href: "/certificadoras",
      },
      {
        title: t('items.irecWorld'),
        description: t('items.irecWorldDesc'),
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.irecWorld'),
        href: "/irec-mundo",
      },
      {
        title: t('items.carbonPrices'),
        description: t('items.carbonPricesDesc'),
        image: "https://images.unsplash.com/photo-1611974714014-419b4578b8bc?q=80&w=600&auto=format&fit=crop",
        alt: t('alt.carbonPrices'),
        href: "/carbono-precos",
      },
    ];

    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-forest-green mb-4">
                {t('title')}
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl">
                {t('subtitle')}
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden block"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-forest-green text-white text-xs font-bold rounded-full mb-3">
                    {category.title}
                  </span>
                  <p className="text-white/90 text-sm font-medium">
                    {category.description}
                  </p>
                </div>
                {category.active && (
                  <div className="absolute top-4 right-4">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
