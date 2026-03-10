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
      canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/'}categorias`,
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
      image: "/images/categories/carbono-brasil.png",
      alt: t('alt.carbonBrazil'),
      href: "/carbono-brasil",
      active: true,
    },
    {
      title: t('items.energyBrazil'),
      description: t('items.energyBrazilDesc'),
      image: "/images/categories/irec-brasil.png",
      alt: t('alt.energyBrazil'),
      href: "/irec-brasil",
    },
    {
      title: t('items.carbonWorld'),
      description: t('items.carbonWorldDesc'),
      image: "/images/categories/carbono-mundo.png",
      alt: t('alt.carbonWorld'),
      href: "/carbono-mundo",
    },
    {
      title: t('items.energyPrices'),
      description: t('items.energyPricesDesc'),
      image: "/images/categories/irec-precos.png",
      alt: t('alt.energyPrices'),
      href: "/irec-precos",
    },
    {
      title: t('items.carbonProjects'),
      description: t('items.carbonProjectsDesc'),
      image: "/images/categories/carbono-projetos.png",
      alt: t('alt.carbonProjects'),
      href: "/carbono-projetos",
    },
    {
      title: t('items.certificadoras'),
      description: t('items.certificadorasDesc'),
      image: "/images/categories/certificadoras.png",
      alt: t('alt.certificadoras'),
      href: "/certificadoras",
    },
    {
      title: t('items.irecWorld'),
      description: t('items.irecWorldDesc'),
      image: "/images/categories/irec-mundo.png",
      alt: t('alt.irecWorld'),
      href: "/irec-mundo",
    },
    {
      title: t('items.carbonPrices'),
      description: t('items.carbonPricesDesc'),
      image: "/images/categories/carbono-precos.png",
      alt: t('alt.carbonPrices'),
      href: "/carbono-precos",
    },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="mb-16">
            <h1 className="text-5xl font-black text-forest-green tracking-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden block border-b-4 border-transparent hover:border-emerald-500 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 bg-slate-200 dark:bg-slate-900"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="inline-block px-4 py-1.5 bg-forest-green text-white text-[10px] uppercase tracking-widest font-black rounded-lg mb-4 shadow-lg">
                      {category.title}
                    </span>
                    <p className="text-white/80 text-base font-medium leading-snug group-hover:text-white transition-colors duration-300">
                      {category.description}
                    </p>
                  </div>
                </div>

                {category.active && (
                  <div className="absolute top-6 right-6">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
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
