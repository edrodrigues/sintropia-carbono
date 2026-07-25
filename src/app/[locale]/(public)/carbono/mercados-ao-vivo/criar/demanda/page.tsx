import { createClient } from "@/lib/supabase/server";
import { getBuyerProfile } from "@/lib/queries/market-listings";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CreateDemandForm } from "@/components/live-markets/listings/CreateDemandForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MarketListings" });
  return {
    title: t("createDemandTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CreateDemandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }

  let userId: string | null = null;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) {
    redirect(`/${locale}/login?next=/${locale}/carbono/mercados-ao-vivo/criar/demanda`);
  }

  const buyerProfile = userId ? await getBuyerProfile(userId) : null;

  const t = await getTranslations({ locale, namespace: "MarketListings" });

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4 mb-2">{t("createDemandTitle")}</h1>
        <p className="text-sm text-slate-500 mb-8">{t("createDemandSubtitle")}</p>
        <CreateDemandForm locale={locale} existingBuyerProfile={buyerProfile} />
      </main>
      <Footer />
    </>
  );
}