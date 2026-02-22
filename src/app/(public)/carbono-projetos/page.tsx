import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import CarbonPlanChartWrapper from "@/components/charts/CarbonPlanChartWrapper";
import { DataSources } from "@/components/ui/DataSources";
import { Callout } from "@/components/ui/tremor";

export default function CarbonoProjetos() {
  const dataSources = [
    { name: "CarbonPlan", url: "https://carbonplan.org" },
  ];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
            Projetos de Carbono
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Visualização interativa dos projetos de carbono registrados no mercado voluntário.
            Dados atualizado diretamente do <CarbonPlanLink />.
          </p>
        </div>

        <CarbonPlanChartWrapper />

        <div className="mt-12">
          <Callout title="Entendendo os IDs dos Projetos" variant="info">
            <p className="mb-4">
              Cada projeto de carbono possui um identificador único (ID) que indica o registry onde está registrado:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong className="text-blue-600 dark:text-blue-400">VCS</strong> - Verra Carbon Standard (ex: VCS2547) - O maior sistema de registry de créditos de carbono do mundo</li>
              <li><strong className="text-green-600 dark:text-green-400">CAR</strong> - Climate Action Reserve (ex: CAR1019) - Registry americano</li>
              <li><strong className="text-purple-600 dark:text-purple-400">ACR</strong> - American Carbon Registry (ex: ACR1000) - Registro americano de carbono</li>
              <li><strong className="text-orange-600 dark:text-orange-400">GLD</strong> - Gold Standard (ex: GLD7737) - Standard suíço para projetos de carbono e desenvolvimento sustentável</li>
              <li><strong className="text-yellow-600 dark:text-yellow-400">CDM</strong> - Clean Development Mechanism (ex: CDM1234) - Mecanismo de Desenvolvimento Limpo da ONU</li>
              <li><strong className="text-pink-600 dark:text-pink-400">GS</strong> - Gold Standard (ex: GS1234) - Versão moderna do Gold Standard</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-6">
          <Callout title="Sobre os Dados" variant="info">
            <p className="mb-4">
              Estes dados são fornecidos pelo <CarbonPlanLink />, uma organização de pesquisa 
              independente que analisa e disponibiliza gratuitamente informações sobre projetos de carbono. 
              Os dados incluem projetos listados no registry da Verra, um dos maiores sistemas de 
              registry de créditos de carbono do mundo.
            </p>
            <p>
              <strong>Nota:</strong> Esta página mostra projetos listados mas ainda não emitidos. 
              Os créditos emitidos serão adicionados conforme os dados forem atualizados.
            </p>
          </Callout>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Download de Dados
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Faça download dos dados completos em formato CSV para análise offline.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/dados/CarbonPlan/projects.csv"
              download
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Projetos CSV
            </a>
            <a
              href="/dados/CarbonPlan/credits.csv"
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Créditos CSV
            </a>
          </div>
        </div>

        <DataSources sources={dataSources} />
      </main>
      <Footer />
    </>
  );
}

function CarbonPlanLink() {
  return (
    <a 
      href="https://carbonplan.org" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-[#1e40af] dark:text-blue-400 hover:underline font-medium"
    >
      carbonplan.org
    </a>
  );
}
