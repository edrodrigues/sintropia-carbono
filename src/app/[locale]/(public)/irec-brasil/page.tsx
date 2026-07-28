import { redirect } from "@/i18n/routing";

export default async function RedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/energia/ranking-brasil", locale });
}
