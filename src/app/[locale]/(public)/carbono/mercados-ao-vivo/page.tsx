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
import { ListingsTabInner } from "@/components/live-markets/listings/ListingsTab";
import { AssetDrawer } from "@/components/live-markets/AssetDrawer";
import { CurrencySelector } from "@/components/live-markets/CurrencySelector";
import { VolumeFilterToggle } from "@/components/live-markets/VolumeFilterToggle";
import {
  getMarketSnapshot,
  getMarketByFilters,
  getDistinctFilterValues,
} from "@/lib/queries/live-markets";
import { getActiveListings } from "@/lib/queries/market-listings";
import { getPriceSeries } from "@/lib/queries/price-series";
import { fetchAllRates } from "@/lib/services/currency-converter";
import { DataSources } from "@/components/ui/DataSources";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { getLatestReferenceDate } from "@/lib/utils/market-helpers";
import { getLocalizedAlternates } from "@/lib/seo";

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
    alternates: getLocalizedAlternates(locale, "/carbono/mercados-ao-vivo"),
  };
}

type TabId = "overview" | "explorer" | "comparator" | "watchlist" | "listagens";

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

  const validTabs: TabId[] = ["overview", "explorer", "comparator", "watchlist", "listagens"];
  const activeTab = validTabs.includes(tab) ? tab : "overview";

  const displayCurrency = typeof sp.displayCurrency === "string" ? sp.displayCurrency : "USD";
  const showAllAssets = sp.volume === "all";
  const rates = await fetchAllRates();

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
  const filteredSnapshot = showAllAssets ? snapshot : snapshot.filter((a) => a.volume != null && Number(a.volume) > 1);

  let drawerAsset: (typeof snapshot)[number] | undefined = undefined;
  let drawerSeries: Awaited<ReturnType<typeof getPriceSeries>> = [];
  let drawerRelated: typeof snapshot = [];

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
    { name: "Carbonmark", url: "https://carbonmark.com" },
    { name: "Toucan Protocol", url: "https://toucan.earth" },
    { name: "KlimaDAO", url: "https://www.klimadao.finance" },
  ];

  const [assetTypes, geographies, registries, technologies, currencies, referenceTypes] = await Promise.all([
    getDistinctFilterValues("asset_type", true),
    getDistinctFilterValues("country", true),
    getDistinctFilterValues("registry", true),
    getDistinctFilterValues("technology", true),
    getDistinctFilterValues("currency", true),
    getDistinctFilterValues("reference_type", true),
  ]);

  const filterOptions = {
    assetTypes: assetTypes.map((v) => ({ label: v, value: v })),
    geographies: geographies.map((v) => ({ label: v, value: v })),
    registries: registries.map((v) => ({ label: v, value: v })),
    technologies: technologies.map((v) => ({ label: v, value: v })),
    currencies: currencies.map((v) => ({ label: v, value: v })),
    referenceTypes: referenceTypes.map((v) => ({ label: v, value: v })),
  };

  const selectedIds = selectedIdsRaw.split(",").filter(Boolean);

  const listingFilters = {
    side: (typeof sp.side === "string" ? (sp.side as "supply" | "demand" | "all") : "all"),
    asset_type: typeof sp.assetType === "string" ? (sp.assetType as "carbon_credit" | "irec" | "both") : undefined,
    registry: typeof sp.registry === "string" ? sp.registry : undefined,
    country: typeof sp.country === "string" ? sp.country : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
  };
  const listings = activeTab === "listagens" ? await getActiveListings(listingFilters) : [];

  const lastReferenceDate = getLatestReferenceDate(snapshot);

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
            <div className="flex items-center gap-4">
              <CurrencySelector />
              <VolumeFilterToggle />
            </div>
          </div>
        </div>

        <LiveMarketsTabs activeTab={activeTab} locale={locale} />

        <div className="mt-6" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "overview" && (
            <OverviewTab
              locale={locale}
              displayCurrency={displayCurrency}
              rates={rates}
              snapshot={filteredSnapshot}
            />
          )}

          {activeTab === "explorer" && (
            <ExplorerTabInner
              assets={(await getMarketByFilters({ ...explorerFilters, recentOnly: true })).filter(
                (a) => showAllAssets || (a.volume != null && Number(a.volume) > 1)
              )}
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

          {activeTab === "listagens" && (
            <ListingsTabInner listings={listings} locale={locale} />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <LastUpdated lastDate={lastReferenceDate} />
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
