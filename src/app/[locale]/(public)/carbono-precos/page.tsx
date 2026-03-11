import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default async function CarbonoPrecosRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Permanent redirect is better for SEO
  redirect(`/${locale}/carbono/precos`);

  // Fallback in case redirect doesn't happen
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Página movida</h1>
        <p className="text-lg text-gray-600 mb-8">
          Esta página agora está localizada em um novo endereço para melhor organização.
        </p>
        <Link 
          href={`/${locale}/carbono/precos`}
          className="inline-flex items-center px-6 py-3 bg-forest-green text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Ir para a nova página de Preços →
        </Link>
      </main>
      <Footer />
    </>
  );
}
