import { redirect } from "@/i18n/routing";

export default async function CarbonoProjetosRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/carbono/projetos", locale });
}
