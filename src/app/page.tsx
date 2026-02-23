import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-[#1e40af] mb-6 tracking-tight">
            Sintropia
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8 font-medium">
            Inteligência gratuita sobre o mercado de carbono e I-REC no Brasil. Rankings, preços e tendências em tempo real.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Plataformas globais cobram $249/mês. Dados brasileiros são raros. A gente resolve isso.
          </p>
        </div>

        {/* Diferenciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
            <div className="text-4xl mb-3">🇧🇷</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Dados Brasileiros
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rankings de 50+ empresas brasileiras que você não encontra em nenhum lugar
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Preços I-REC
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preços por tecnologia (hidro, eólica, solar) no Brasil e no mundo
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Comparativos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Atualizados mensalmente com dados de carbono e energia renovável
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center">
            <div className="text-4xl mb-3">🔓</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Código Aberto
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tudo no GitHub. Qualquer um pode auditar e contribuir
            </p>
          </div>
        </div>

        {/* Links Principais */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            O que você pode explorar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/carbono-brasil"
              className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-xl border border-green-200 dark:border-green-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌴</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Carbono Brasil
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ranking das empresas brasileiras por setor. Quem está compensando mais carbono?
              </p>
              <div className="text-green-600 font-semibold">
                Ver ranking →
              </div>
            </Link>

            <Link
              href="/irec-brasil"
              className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚡</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Energia Brasil
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Empresas que usam energia renovável no Brasil. топ 25 por I-REC.
              </p>
              <div className="text-blue-600 font-semibold">
                Ver ranking →
              </div>
            </Link>

            <Link
              href="/carbono-precos"
              className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 p-6 rounded-xl border border-orange-200 dark:border-orange-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💵</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Preços Carbono
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Preços do mercado regulado (EU ETS) e voluntário. Compare qualidade e preços.
              </p>
              <div className="text-orange-600 font-semibold">
                Ver preços →
              </div>
            </Link>

            <Link
              href="/irec-precos"
              className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">☀️</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Preços Energia
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Por que o Brasil tem os menores preços do mundo? Compare por país e tecnologia.
              </p>
              <div className="text-yellow-600 font-semibold">
                Ver preços →
              </div>
            </Link>

            <Link
              href="/carbono-mundo"
              className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌎</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Carbono Mundo
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Quem são os maiores compradores de carbono no mundo? Big Techs lideram.
              </p>
              <div className="text-indigo-600 font-semibold">
                Ver ranking →
              </div>
            </Link>

            <Link
              href="/certificadoras"
              className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800 p-6 rounded-xl border border-teal-200 dark:border-teal-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏛️</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Certificadoras
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Verra, Gold Standard, GS4GG. Qual certificationa emite mais créditos?
              </p>
              <div className="text-teal-600 font-semibold">
                Ver comparativo →
              </div>
            </Link>

            <Link
              href="/carbono-projetos"
              className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-6 rounded-xl border border-amber-200 dark:border-amber-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌳</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Projetos Carbono
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore projetos de carbono registrados no mercado voluntário. Dados do CarbonPlan.
              </p>
              <div className="text-amber-600 font-semibold">
                Ver projetos →
              </div>
            </Link>
          </div>
        </div>

        {/* Comunidade */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Comunidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/feed"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 block hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <span className="text-4xl mb-3 block">📝</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Posts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Compartilhe e discuta sobre o mercado
              </p>
            </Link>

            <Link
              href="/profiles"
              className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 block hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <span className="text-4xl mb-3 block">👥</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Membros
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explore a comunidade
              </p>
            </Link>

            <Link
              href="/leaderboard"
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 block hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <span className="text-4xl mb-3 block">🏆</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Ranking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Os mais ativos
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 block hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <span className="text-4xl mb-3 block">📊</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Minha Página
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Acompanhe sua atividade
              </p>
            </Link>
          </div>
        </div>

        {/* Nosso Objetivo */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nosso Objetivo
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            <strong>Tornar o mercado de carbono transparente e acessível para todos.</strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Se você trabalha com carbono ou energia renovável, a Sintropia é para você.
          </p>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-[#1e40af] text-white font-semibold rounded-xl hover:bg-[#1e3a8a] transition-colors"
            >
              Criar conta grátis →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
