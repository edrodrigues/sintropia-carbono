import { permanentRedirect } from "next/navigation";
import { localizedPath } from "@/lib/seo";

export default async function IrecBrasilRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(localizedPath(locale, "/energia/ranking-brasil"));
}
