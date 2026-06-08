import { redirect } from "@/i18n/routing";

export default async function CarbonoBrasilRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/carbono/ranking-brasil", locale });
}
