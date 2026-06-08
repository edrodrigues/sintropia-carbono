import { redirect } from "@/i18n/routing";

export default async function CarbonoPrecosRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/carbono/precos", locale });
}
