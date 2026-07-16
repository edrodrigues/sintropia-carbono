export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const keywords = locale === "pt"
    ? ["mercados ao vivo", "preços carbono", "I-REC preços", "inteligência de mercado carbono", "agregador preços carbono"]
    : ["live markets", "carbon prices", "I-REC prices", "carbon market intelligence", "carbon price aggregator"];

  return {
    title: t("title"),
    description: t("subtitle"),
    keywords,
    alternates: {
      canonical: `https://sintropia.space/${locale}/carbono/mercados-ao-vivo`,
    },
  };
}

export default async function CarbonoLiveMarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-12">
        <Breadcrumb />

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#059669] mb-2 font-inter dark:text-emerald-400">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-inter">
            {t("subtitle")}
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-8 lg:p-12 mb-12 shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 text-9xl font-black text-white/20">AO VIVO</div>
            <div className="absolute bottom-4 left-8 text-9xl font-black text-white/20">LIVE</div>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {t("comingSoon")}
              </span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-inter">
              {t("whatIs")}
            </h3>
            <p className="text-lg text-emerald-50 max-w-3xl font-inter">
              {t("whatIsDesc")}
            </p>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-8">
          <div className="p-6 lg:p-8">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {t("comingSoonDesc")}
            </p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-inter">
            {t("features")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📊", titleKey: "featureDashboard", descKey: "featureDashboardDesc" },
              { icon: "🔍", titleKey: "featureSearch", descKey: "featureSearchDesc" },
              { icon: "⚖️", titleKey: "featureCompare", descKey: "featureCompareDesc" },
              { icon: "🔔", titleKey: "featureWatchlist", descKey: "featureWatchlistDesc" },
              { icon: "📤", titleKey: "featureExport", descKey: "featureExportDesc" },
              { icon: "🌐", titleKey: "featureSources", descKey: "featureSourcesDesc" },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(feature.titleKey)}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scope Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                {t("scope")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("scopeDesc")}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                {t("notIncluded")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("notIncludedItems")}
              </p>
            </div>
          </Card>
        </div>

        {/* Data Transparency */}
        <Card className="mb-8">
          <div className="p-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {t("dataTransparency")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("dataTransparencyDesc")}
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}
