export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CertificadorasChart } from "@/components/charts/CertificadorasChart";
import { EnergiaRenovavelChart } from "@/components/charts/EnergiaRenovavelChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Certificadoras' });
  
  const titles: Record<string, string> = {
    pt: "Certificadoras Carbono e Energia | Verra, Gold Standard, I-REC",
    en: "Carbon and Energy Certifiers | Verra, Gold Standard, I-REC"
  };
  
  const descriptions: Record<string, string> = {
    pt: "Principais certificadoras e padrões de carbono e energia renovável. Verra, Gold Standard, RenovaBio, ACR, I-REC e outros padrões.",
    en: "Main certifiers and standards for carbon and renewable energy. Verra, Gold Standard, RenovaBio, ACR, I-REC and other standards."
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords: locale === "pt" 
      ? ["certificadoras carbono", "Verra", "Gold Standard", "I-REC", "RenovaBio", "certificação energia renovável"]
      : ["carbon certifiers", "Verra", "Gold Standard", "I-REC", "RenovaBio", "renewable energy certification"],
    alternates: {
      canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/' }certificadoras`,
    },
  };
}

const certificadoras = [
  { nome: "Verra (VCS)", sede: "EUA", foco: "REDD+, Florestas, Indústria", unidade: "tCO2e", volume: "1.1B", url: "https://verra.org" },
  { nome: "Gold Standard", sede: "Suíça", foco: "ODS, Energia, Florestas", unidade: "tCO2e", volume: "245M", url: "https://goldstandard.org" },
  { nome: "RenovaBio", sede: "Brasil", foco: "Biocombustíveis", unidade: "CBIO", volume: "135M", url: "https://www.gov.br/anp/pt-br/assuntos/renovaBio" },
  { nome: "ACR (American Carbon Registry)", sede: "EUA", foco: "Florestas, Manejo", unidade: "tCO2e", volume: "250M", url: "https://americancarbonregistry.org" },
  { nome: "CAR (Climate Action Reserve)", sede: "EUA", foco: "Florestas, Aterros", unidade: "tCO2e", volume: "195M", url: "https://climateactionreserve.org" },
  { nome: "ART/TREES", sede: "Jurisdicional", foco: "REDD+ em escala estatal", unidade: "tCO2e", volume: "45M", url: "https://artredd.org" },
  { nome: "GCC (Global Climate Council)", sede: "Catar", foco: "Energia Renovável", unidade: "tCO2e", volume: "20M", url: "https://globalcarboncouncil.com" },
  { nome: "Plan Vivo", sede: "Reino Unido", foco: "REDD+, Agricultura", unidade: "tCO2e", volume: "14M", url: "https://planvivo.org" },
  { nome: "CDM (Clean Development Mechanism)", sede: "Global", foco: "Projetos CDM", unidade: "tCO2e", volume: "9M", url: "https://cdm.unfccc.int" },
  { nome: "Social Carbon", sede: "Brasil", foco: "REDD+, Comunidades", unidade: "tCO2e", volume: "7M", url: "https://socialcarbon.org" },
];

const energiaPadroes = [
  { nome: "I-REC (International REC)", origem: "Países Baixos (Global)", metodologia: "Book-and-Claim (I-TRACK Foundation)", volume2024: "283.000.000 MWh", volume2025: "Parcial (ex.: 54M no Brasil até meados)", atributos: "Padrão global para mercados voluntários; adotado em mais de 50 países; alta transparência.", url: "https://trackingstandard.org" },
  { nome: "Guarantees of Origin (GO)", origem: "União Europeia (AIB)", metodologia: "European Energy Certificate System (EECS)", volume2024: "1.084.000.000 MWh", volume2025: "Não disponível", atributos: "Instrumento regulado pela UE; obrigatório para divulgação do mix energético dos fornecedores.", url: "https://aib-net.org" },
  { nome: "Green-e Energy", origem: "EUA e Canadá", metodologia: "Certificação de Varejo e Auditoria de Transação", volume2024: "143.576.000 MWh", volume2025: "Não disponível", atributos: "Foco em proteção ao consumidor e critérios rigorosos de adicionalidade para novos projetos.", url: "https://green-e.org" },
  { nome: "TIGR (Tradable Instrument for Global Renewables)", origem: "EUA (Global)", metodologia: "Registro Digital (APX/Xpansiv)", volume2024: "~9.870.000 MWh (2023)", volume2025: "Não disponível", atributos: "Plataforma tecnológica integrada; forte em mercados do sudeste asiático e América Central.", url: "https://apx.com" },
  { nome: "REC Brazil", origem: "Brasil", metodologia: "I-REC + Adicionalidade Social e Ambiental (SDGs)", volume2024: "Parcial (ex.: 1,4M por uma empresa)", volume2025: "Não disponível", atributos: "Chancela brasileira gerida pelo Instituto Totum; exige alinhamento com 5 dos 17 ODS da ONU.", url: "https://irec-brazil.org" },
  { nome: "LGC (Large-scale Generation Certificates)", origem: "Austrália", metodologia: "Large-scale Renewable Energy Target (LRET)", volume2024: "51.500.000 MWh", volume2025: "Projeção: 54-57M MWh", atributos: "Sistema de conformidade legal com transição para rastreamento horário (REGO) em 2025.", url: "https://cer.gov.au" },
  { nome: "Non-Fossil Certificates (NFC)", origem: "Japão", metodologia: "Non-Fossil Value Trading Market (JEPX)", volume2024: "Parcial (~15.343 GWh em uma rodada FY2024)", volume2025: "Não disponível", atributos: "Segmentado entre fontes FIT e não-FIT; inclui nuclear como fonte não-fóssil.", url: "https://jepx.org" },
  { nome: "UK REGO", origem: "Reino Unido", metodologia: "Fuel Mix Disclosure (Ofgem)", volume2024: "~40.100.000 MWh (estimativa ROCs)", volume2025: "Não disponível", atributos: "Específico para o mercado britânico; essencial para conformidade com o reporte de emissões do governo.", url: "https://ofgem.gov.uk" },
  { nome: "EKOenergy", origem: "Finlândia (Global)", metodologia: "Selo de Qualidade e Critérios de Biodiversidade", volume2024: "Record (volume exato não especificado)", volume2025: "Não disponível", atributos: "Ecolabel independente; exige sustentabilidade além da fonte (impacto em aves, peixes e ecossistemas).", url: "https://ekoenergy.org" },
  { nome: "Gold Standard Renewable Energy Label", origem: "Suíça (Global)", metodologia: "GS4GG (Global Goals for Sustainable Development)", volume2024: "Não disponível", volume2025: "Não disponível", atributos: "Aplicado sobre RECs para garantir integridade ambiental; foco em alta qualidade e benefícios sociais diretos.", url: "https://goldstandard.org" },
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

export default async function Certificadoras({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Certificadoras' });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <CertificadorasChart />

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🌍 {locale === 'pt' ? 'Certificadoras de Carbono' : 'Carbon Certifiers'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {locale === 'pt' ? 'Principais padrões e certificadoras de créditos de carbono.' : 'Main carbon credit standards and certifiers.'}
            </p>
          </div>
          <div className="p-6">
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('table.certificadora')}</TableHeader>
                    <TableHeader>{t('table.sede')}</TableHeader>
                    <TableHeader>{t('table.foco')}</TableHeader>
                    <TableHeader>{t('table.unidade')}</TableHeader>
                    <TableHeader className="text-right">{t('table.volume')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificadoras.map((cert, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e40af] hover:underline font-semibold"
                        >
                          {cert.nome} ↗
                        </a>
                      </TableCell>
                      <TableCell>{cert.sede}</TableCell>
                      <TableCell>{cert.foco}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          {cert.unidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{cert.volume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <EnergiaRenovavelChart />
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              ⚡ Certificadoras de Energia Renovável
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sistemas de rastreamento e certificação de energia limpa.
            </p>
          </div>
          <div className="p-6">
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Padrão</TableHeader>
                    <TableHeader>Origem</TableHeader>
                    <TableHeader>Metodologia</TableHeader>
                    <TableHeader>Volume 2024</TableHeader>
                    <TableHeader>Volume 2025</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {energiaPadroes.map((padrao, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <a
                          href={padrao.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e40af] hover:underline font-semibold"
                        >
                          {padrao.nome} ↗
                        </a>
                      </TableCell>
                      <TableCell>{padrao.origem}</TableCell>
                      <TableCell>{padrao.metodologia}</TableCell>
                      <TableCell className="font-mono">{padrao.volume2024}</TableCell>
                      <TableCell>{padrao.volume2025}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              💡 Atributos e Diferenciais
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Principais características de cada padrão de certificação.
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {energiaPadroes.map((padrao, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <a
                      href={padrao.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e40af] hover:underline font-semibold"
                    >
                      {padrao.nome}
                    </a>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {padrao.atributos}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
