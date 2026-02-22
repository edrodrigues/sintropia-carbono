import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonPlanChart } from "@/components/charts/CarbonPlanChart";
import { DataSources } from "@/components/ui/DataSources";

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
            Visualização interativa dos projetos de carbono registryados no mercado voluntário.
            Dados atualizado diretamente do <CarbonPlanLink />.
          </p>
        </div>

        <CarbonPlanChart />

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
            Sobre os Dados
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
            Estes dados são fornecidos pelo <CarbonPlanLink />, uma organização de pesquisa 
            independente que analisa e免费提供 informações sobre projetos de carbono. 
            Os dados incluem projetos listados no registry da Verra, um dos maiores sistemas de 
            registry de créditos de carbono do mundo.
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Nota:</strong> Esta página mostra projetos listados mas ainda não emitidos. 
            Os créditos emitidos serão adicionados conforme os dados forem atualizados.
          </p>
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
