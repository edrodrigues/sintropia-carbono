export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LiveMarketsTabs } from "@/components/live-markets/LiveMarketsTabs";
import { OverviewTab } from "@/components/live-markets/OverviewTab";
import { ExplorerTabInner } from "@/components/live-markets/ExplorerTab";
import { ComparatorTab } from "@/components/live-markets/ComparatorTab";
import { WatchlistTab } from "@/components/live-markets/WatchlistTab";
import { AssetDrawer } from "@/components/live-markets/AssetDrawer";
import { CurrencySelector } from "@/components/live-markets/CurrencySelector";
import {
  getMarketSnapshot,
  getMarketByFilters,
  getDistinctFilterValues,
} from "@/lib/queries/live-markets";
import { getPriceSeries } from "@/lib/queries/price-series";
import { fetchAllRates } from "@/lib/services/currency-converter";
import { DataSources } from "@/components/ui/DataSources";
import { LastUpdated } from "@/components/ui/LastUpdated";

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

type TabId = "overview" | "explorer" | "comparator" | "watchlist";

export default async function CarbonoLiveMarketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const tab = (typeof sp.tab === "string" ? sp.tab : "overview") as TabId;
  const assetSlug = typeof sp.asset === "string" ? sp.asset : null;
  const selectedIdsRaw = typeof sp.sel === "string" ? sp.sel : "";

  const validTabs: TabId[] = ["overview", "explorer", "comparator", "watchlist"];
  const activeTab = validTabs.includes(tab) ? tab : "overview";

  const displayCurrency = typeof sp.displayCurrency === "string" ? sp.displayCurrency : "USD";
  const rates = await fetchAllRates();

  // Read filter params for the Explorer tab
  const explorerFilters = {
    assetType: typeof sp.assetType === "string" ? sp.assetType : undefined,
    geography: typeof sp.geography === "string" ? sp.geography : undefined,
    registry: typeof sp.registry === "string" ? sp.registry : undefined,
    technology: typeof sp.technology === "string" ? sp.technology : undefined,
    currency: typeof sp.currency === "string" ? sp.currency : undefined,
    referenceType: typeof sp.referenceType === "string" ? sp.referenceType : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
  };

  const snapshot = await getMarketSnapshot(true);

  let drawerAsset: (typeof snapshot)[number] | undefined = undefined;
  let drawerSeries: Awaited<ReturnType<typeof getPriceSeries>> = [];
  let drawerRelated: (typeof snapshot)[number][] = [];

  if (assetSlug) {
    drawerAsset = snapshot.find(
      (a) => a.slug === assetSlug || a.asset_id === assetSlug || a.asset_name === assetSlug
    );
    if (drawerAsset?.asset_id) {
      const [series, related] = await Promise.all([
        getPriceSeries(drawerAsset.asset_id, 30),
        getMarketByFilters({
          assetType: drawerAsset.asset_type ?? undefined,
          recentOnly: true,
        }),
      ]);
      drawerSeries = series;
      drawerRelated = related.filter((i) => i.asset_id !== drawerAsset!.asset_id).slice(0, 3);
    }
  }

  const dataSources = [
    { name: "Sintropia Carbono", url: "https://sintropia.space" },
    { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
    { name: "BloombergNEF", url: "https://about.bnef.com" },
  ];

  const filterOptions = {
    assetTypes: await getDistinctFilterValues("asset_type", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
    geographies: await getDistinctFilterValues("country", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
    registries: await getDistinctFilterValues("registry", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
    technologies: await getDistinctFilterValues("technology", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
    currencies: await getDistinctFilterValues("currency", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
    referenceTypes: await getDistinctFilterValues("reference_type", true).then((vals) =>
      vals.map((v) => ({ label: v, value: v }))
    ),
  };

  const selectedIds = selectedIdsRaw.split(",").filter(Boolean);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8" aria-label="Live Markets">
        <Breadcrumb />

        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("title")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t("subtitle")}
              </p>
            </div>
            <CurrencySelector />
          </div>
        </div>

        <LiveMarketsTabs activeTab={activeTab} locale={locale} />

        <div className="mt-6" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "overview" && (
            <OverviewTab locale={locale} displayCurrency={displayCurrency} rates={rates} />
          )}

          {activeTab === "explorer" && (
            <ExplorerTabInner
              assets={await getMarketByFilters({ ...explorerFilters, recentOnly: true })}
              filterOptions={filterOptions}
              displayCurrency={displayCurrency}
              rates={rates}
            />
          )}

          {activeTab === "comparator" && (
            <ComparatorTab
              selectedIds={selectedIds}
              locale={locale}
              displayCurrency={displayCurrency}
              rates={rates}
            />
          )}

          {activeTab === "watchlist" && (
            <WatchlistTab locale={locale} displayCurrency={displayCurrency} rates={rates} />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <LastUpdated dataFile="mercados-ao-vivo" />
        </div>

        <div className="mt-4">
          <DataSources sources={dataSources} />
        </div>
      </main>

      <AssetDrawer
        asset={drawerAsset}
        priceSeries={drawerSeries}
        relatedAssets={drawerRelated}
        displayCurrency={displayCurrency}
        rates={rates}
      />

      <Footer />
    </>
  );
}
