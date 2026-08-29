import { permanentRedirect } from "next/navigation";
import { localizedPath } from "@/lib/seo";

export default async function CarbonoMundoRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(localizedPath(locale, "/carbono/ranking-mundo"));
}
