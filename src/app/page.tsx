import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Tooltip } from "@/components/ui/Tooltip";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-[#1e40af] mb-6 tracking-tighter">
            Sintropia
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            Dados sobre o mercado de carbono e energia renovável no Brasil e no mundo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/30">
              ✨ Novo: Comunidade
            </span>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Certificadoras Carbono
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">7</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              padrões de carbono globais
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Certificadoras Energia
            </p>
            <h3 className="text-3xl font-bold text-indigo-600">10</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              padrões de energia renovável
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Mercado Global
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">2.1B</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Tooltip content="Toneladas de CO2 compensadas">
                <span className="border-b border-dashed border-gray-400 cursor-help">toneladas de carbono</span>
              </Tooltip>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Empresas Brasil
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">25</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              no ranking por setor
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Setores
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">15</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              setores representados
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Energia (Brasil)
            </p>
            <h3 className="text-3xl font-bold text-indigo-600">46.3M</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Tooltip content="Certificados de Energia Renovável (I-REC)">
                <span className="border-b border-dashed border-gray-400 cursor-help">certificados</span>
              </Tooltip> em 2025
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Energia (Mundo)
            </p>
            <h3 className="text-3xl font-bold text-teal-600">283</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Tooltip content="Terawatt-hora (unidade de energia)">
                <span className="border-b border-dashed border-gray-400 cursor-help">TWh</span>
              </Tooltip> em 2025
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Compradores Globais
            </p>
            <h3 className="text-3xl font-bold text-orange-600">92.4M</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Tooltip content="Toneladas de CO2 compensadas">
                <span className="border-b border-dashed border-gray-400 cursor-help">toneladas de carbono</span>
              </Tooltip> em 2025
            </p>
          </div>
        </div>

        {/* Comunidade Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <span>💬</span> Comunidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/feed"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">📝</span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">NOVO</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Posts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Compartilhe notícias, tire dúvidas e discuta sobre o mercado de carbono.
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                Ver posts →
              </div>
            </Link>

            <Link
              href="/profiles"
              className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">👥</span>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">NOVO</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Perfis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explore os membros da comunidade e suas contribuições.
              </p>
              <div className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                Ver membros →
              </div>
            </Link>

            <Link
              href="/leaderboard"
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🏆</span>
                <span className="bg-yellow-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">NOVO</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Ranking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Veja os membros mais ativos da comunidade.
              </p>
              <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm font-semibold">
                Ver ranking →
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 block hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">📊</span>
                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">NOVO</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Minha Página
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Acompanhe sua atividade, posts e karma na comunidade.
              </p>
              <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                Acessar →
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          <Link
            href="/certificadoras"
            className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🏛️</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Certificadoras
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              17 principais certificadoras globais e nacionais.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                Verra: 1.1B
              </span>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                Gold: 245M
              </span>
            </div>
          </Link>

          <Link
            href="/irec-brasil"
            className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">⚡</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Energia (Brasil)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Top 25 empresas brasileiras no mercado de I-RECs.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                46.3M I-RECs
              </span>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                +26.9%
              </span>
            </div>
          </Link>

          <Link
            href="/irec-mundo"
            className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">☀️</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Energia (Mundo)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Top 25 corporações globais em energia renovável.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                283 TWh
              </span>
              <span className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                Amazon líder
              </span>
            </div>
          </Link>

          <Link
            href="/carbono-mundo"
            className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🏢</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Carbono (Mundo)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Top 25 compradores globais de créditos de carbono.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                92.4M tCO2e
              </span>
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                Microsoft líder
              </span>
            </div>
          </Link>

          <Link
            href="/carbono-brasil"
            className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🌴</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Carbono (Brasil)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ranking por setor com 15 áreas representadas.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                15.9M tCO2e
              </span>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                +23.4%
              </span>
            </div>
          </Link>

          <Link
            href="/irec-precos"
            className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💰</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Energia (Preços)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Preços de certificados I-REC Brasil e mundo.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                Brasil: $0.16-0.24
              </span>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                México: $4.30-5.05
              </span>
            </div>
          </Link>

          <Link
            href="/carbono-precos"
            className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 block hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💵</span>
              <span className="text-[#1e40af] font-semibold text-sm">Ver →</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Carbono (Preços)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mercados de carbono global e América Latina.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                EU ETS: €60-80
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                VCM: $3.50-14.80
              </span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              📊 Liderança da Verra
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              A Verra (VCS) lidera o mercado global com 1.1 bilhão de tCO2e
              certificados.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
              🌱 RenovaBio Brasil
            </h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              Programa brasileiro com 135 milhões de CBIOs certificados.
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
              ⚡ Mercado Energia
            </h4>
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              Crescimento de 26.9% com Eletrobras liderando com 14.5M I-RECs.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              📈 Setor Financeiro
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Maior comprador de créditos com crescimento médio de 23.4%.
            </p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-teal-900 dark:text-teal-200 mb-2">
              ⚡ Energia (Mundo)
            </h4>
            <p className="text-sm text-teal-800 dark:text-teal-300">
              Big Tech lidera com 283 TWh. Amazon, Microsoft, Meta e Google juntos
              representam 60% do total.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">
              💰 Mercado de Carbono
            </h4>
            <p className="text-sm text-red-800 dark:text-red-300">
              América Latina: USD $63B (2025) projetando crescimento para USD
              $824B (2034) a 33% CAGR.
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
              📊 Preços Energia
            </h4>
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              Brasil mantém os menores preços globais ($0.16-0.24/MWh), 10-30x mais
              barato que México ($4.30-5.05).
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sobre o Projeto
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Sintropia é um projeto <strong>open source</strong> colaborativo
            que visa democratizar o acesso a informações sobre o mercado de carbono e
            certificados de energia renovável.
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⭐</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sistema de Karma
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-4">
                Como ganhar Karma?
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-orange-500 font-bold text-lg">⬆</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">+10</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">quando alguém curte seu post</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-orange-500 font-bold text-lg">⬆</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">+5</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">quando alguém curte seu comentário</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-blue-500 font-bold text-lg">⬇</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">-2</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">quando alguém descurte</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-4">
                Badges por Karma
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-xl">🥚</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Novato</span>
                    <span className="text-gray-500 text-xs ml-1">(0+)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-xl">🌱</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Iniciante</span>
                    <span className="text-gray-500 text-xs ml-1">(10+)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-xl">🌟</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Contribuidor</span>
                    <span className="text-gray-500 text-xs ml-1">(100+)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <span className="text-xl">💎</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Especialista</span>
                    <span className="text-gray-500 text-xs ml-1">(500+)</span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 p-3 rounded-xl">
                  <span className="text-2xl">👑</span>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">Master</span>
                    <span className="text-gray-500 text-sm ml-1">(1000+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 text-center font-medium">
              💡 Participe da comunidade, contribua com conteúdo de qualidade e suba no ranking!
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Como Contribuir
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Este é um projeto colaborativo! Você pode contribuir de várias formas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐛</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Reportando bugs
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajude a identificar e corrigir problemas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Sugerindo funcionalidades
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compartilhe suas ideias de melhorias
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Atualizando dados
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mantenha as informações do mercado atualizadas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Melhorando o design
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contribua com a interface visual
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Documentando
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajude a melhorar a documentação do projeto
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Divulgando
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compartilhe o projeto com sua rede
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
