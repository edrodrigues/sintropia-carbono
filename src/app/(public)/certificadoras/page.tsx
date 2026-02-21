import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CertificadorasChart } from "@/components/charts/CertificadorasChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";

const certificadoras = [
  // ... (rest of the file)
  { nome: "Verra (VCS)", sede: "EUA", foco: "REDD+, Florestas, Energia", unidade: "tCO2e", volume: "1.1B", url: "https://verra.org" },
  { nome: "Gold Standard", sede: "Suíça", foco: "ODS, Energia, Florestas", unidade: "tCO2e", volume: "245M", url: "https://goldstandard.org" },
  { nome: "RenovaBio", sede: "Brasil", foco: "Biocombustíveis", unidade: "CBIO", volume: "135M", url: "https://.gov.br/anp/renovabio" },
  { nome: "ACR (American Carbon Registry)", sede: "EUA", foco: "Florestas, Manejo", unidade: "tCO2e", volume: "250M", url: "https://americancarbonregistry.org" },
  { nome: "CAR (Climate Action Reserve)", sede: "EUA", foco: "Florestas, Aterros", unidade: "tCO2e", volume: "195M", url: "https://climateactionreserve.org" },
  { nome: "ART/TREES", sede: "EUA", foco: "REDD+ Jurisdicional", unidade: "tCO2e", volume: "45M", url: "https://artreest.org" },
  { nome: "GCC (Global Climate Council)", sede: "EUA", foco: "Energia Renovável", unidade: "tCO2e", volume: "20M", url: "https://gcc01.org" },
  { nome: "Plan Vivo", sede: "Reino Unido", foco: "REDD+, Agricultura", unidade: "tCO2e", volume: "14M", url: "https://planvivo.org" },
  { nome: "CDM (Clean Development Mechanism)", sede: "Global", foco: "Projetos CDM", unidade: "tCO2e", volume: "9M", url: "https://cdm.unfccc.int" },
  { nome: "Social Carbon", sede: "Brasil", foco: "REDD+, Comunidades", unidade: "tCO2e", volume: "7M", url: "https://socialcarbon.org" },
];

const energiaPadroes = [
  { nome: "I-REC (International REC)", origem: "Países Baixos (Global)", cobertura: "Book-and-Claim - +50 países", metodologia: "I-TRACK Foundation", volume: "283 TWh (2023)", url: "https://trackingstandard.org" },
  { nome: "Guarantees of Origin (GO)", origem: "União Europeia (AIB)", cobertura: "Sistema Europeu EECS", metodologia: "European Energy Certificate System", volume: "1.084 TWh (2024)", url: "https://aib-net.org" },
  { nome: "Green-e Energy", origem: "EUA e Canadá", cobertura: "Certificação de Varejo", metodologia: "Auditoria de Transação", volume: "110 MWh (2021)", url: "https://green-e.org" },
  { nome: "TIGR (Tradable Instrument for Global Renewables)", origem: "EUA (Global)", cobertura: "Sudeste Asiático e América Central", metodologia: "Registro Digital (APX/Xpansiv)", volume: "~2% mercado internacional", url: "https://apx.com" },
  { nome: "REC Brazil", origem: "Brasil", cobertura: "I-REC + Adicionalidade Social", metodologia: "Instituto Totum (SDGs)", volume: "+73% crescimento (2023)", url: "https://irec-brazil.org" },
  { nome: "LGC (Large-scale Generation Certificates)", origem: "Austrália", cobertura: "Large-scale Renewable Energy Target", metodologia: "LRET + REGO (2025)", volume: "51.5M certificados (2024)", url: "https://cer.gov.au" },
  { nome: "Non-Fossil Certificates (NFC)", origem: "Japão", cobertura: "Mercado JEPX", metodologia: "Non-Fossil Value Trading", volume: "143.8 bilhões kWh (2024)", url: "https://jepx.org" },
  { nome: "UK REGO", origem: "Reino Unido", cobertura: "Fuel Mix Disclosure", metodologia: "Ofgem", volume: "£25/MWh (2023)", url: "https://ofgem.gov.uk" },
  { nome: "EKOenergy", origem: "Finlândia (Global)", cobertura: "Selo de Qualidade Global", metodologia: "Critérios de Biodiversidade", volume: "3.000+ instalações (2024)", url: "https://ekoenergy.org" },
  { nome: "Gold Standard Renewable Energy Label", origem: "Suíça (Global)", cobertura: "GS4GG - Objetivos ODS", metodologia: "Consulta pública a stakeholders", volume: "Aplicado sobre RECs", url: "https://goldstandard.org" },
];

const dataSources = [
  { name: "Verra Registry", url: "https://verra.org" },
  { name: "Gold Standard", url: "https://goldstandard.org" },
  { name: "I-REC Standard", url: "https://trackingstandard.org" },
  { name: "AIB (GO)", url: "https://aib-net.org" },
  { name: "Green-e", url: "https://green-e.org" },
  { name: "APX/TIGR", url: "https://apx.com" },
  { name: "REC Brazil", url: "https://irec-brazil.org" },
  { name: "CER (Austrália)", url: "https://cer.gov.au" },
  { name: "JEPX (Japão)", url: "https://jepx.org" },
  { name: "Ofgem (UK REGO)", url: "https://ofgem.gov.uk" },
  { name: "EKOenergy", url: "https://ekoenergy.org" },
];

export default function Certificadoras() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2">
            Certificadoras e Padrões de Carbono
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Principais certificadoras globais e nacionais com seus volumes
            certificados e áreas de foco.
          </p>
        </div>

        <CertificadorasChart />

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Certificadora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sede / Região
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Foco Principal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Volume Total Certificado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {certificadoras.map((cert, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e40af] hover:underline font-semibold"
                      >
                        {cert.nome} ↗
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {cert.sede}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {cert.foco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        {cert.unidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {cert.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              ⚡ Padrões de Certificação de Energia Renovável
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sistemas de rastreamento e certificação de energia limpa utilizados
              globalmente.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Padrão
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cobertura
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Metodologia
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {energiaPadroes.map((padrao, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={padrao.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e40af] hover:underline font-semibold"
                      >
                        {padrao.nome} ↗
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {padrao.origem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {padrao.cobertura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {padrao.metodologia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {padrao.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              🌍 O que são Certificados de Energia?
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Os certificados de energia renovável (I-RECs, GOs, RECs) são
              instrumentos que comprovam a origem renovável da eletricidade
              consumida. Cada certificado representa 1 MWh de energia
              produzida a partir de fontes renováveis (solar, eólica,
              hidrelétrica, biomassa, etc.). Empresas utilizam esses
              certificados para comprovar suas metas de sustentabilidade e
              neutralidade de carbono.
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              📊 Principais Mercados
            </h4>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
              <li>
                <strong>Europa (GOs):</strong> Maior mercado mundial, sistema
                harmonizado entre países da UE
              </li>
              <li>
                <strong>Estados Unidos (RECs):</strong> Mercado maduro com
                diferentes tipos (SRECs, TRECs)
              </li>
              <li>
                <strong>Ásia (I-REC):</strong> Crescimento acelerado em China,
                Índia e Sudeste Asiático
              </li>
              <li>
                <strong>Brasil:</strong> Mercado emergente com I-REC Brasil e
                potencial hidrelétrico
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            Legenda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong>tCO2e:</strong> Toneladas de CO2 equivalente
            </div>
            <div>
              <strong>CBIO:</strong> Crédito de Descarbonização (unidade do
              RenovaBio)
            </div>
            <div>
              <strong>REDD+:</strong> Redução de Emissões por Desmatamento e
              Degradação Florestal
            </div>
            <div>
              <strong>ODS:</strong> Objetivos de Desenvolvimento Sustentável
            </div>
            <div>
              <strong>IFM:</strong> Manejo Florestal Intensivo
            </div>
            <div>
              <strong>MWh:</strong> Megawatt-hora (unidade de energia)
            </div>
            <div>
              <strong>TWh:</strong> Terawatt-hora (1.000.000 MWh)
            </div>
            <div>
              <strong>I-REC:</strong> International Renewable Energy Certificate
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="certificadoras" />
        </div>

        <DataSources sources={dataSources} downloadFile={{ name: "dados.md", path: "/dados/dados.md" }} />
      </main>
      <Footer />
    </>
  );
}
