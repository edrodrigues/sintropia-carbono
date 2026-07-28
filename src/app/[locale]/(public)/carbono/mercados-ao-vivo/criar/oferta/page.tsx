import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CreateSupplyForm } from "@/components/live-markets/listings/CreateSupplyForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MarketListings" });
  return {
    title: t("createSupplyTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CreateSupplyPage({ params }: { params: Promise<{ locale: string }> }) {
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
    redirect(`/${locale}/login?next=/${locale}/carbono/mercados-ao-vivo/criar/oferta`);
  }

  const t = await getTranslations({ locale, namespace: "MarketListings" });

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4 mb-2">{t("createSupplyTitle")}</h1>
        <p className="text-sm text-slate-500 mb-8">{t("createSupplySubtitle")}</p>
        <CreateSupplyForm locale={locale} />
      </main>
      <Footer />
    </>
  );
}