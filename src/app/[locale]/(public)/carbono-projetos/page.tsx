export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import CarbonPlanChartWrapper from "@/components/charts/CarbonPlanChartWrapper";
import { DataSources } from "@/components/ui/DataSources";
import { Callout } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoProjetos' });
  
  const keywords = locale === "pt"
    ? ["projetos carbono", "CarbonPlan", "Verra projetos", "Gold Standard", "créditos carbono projetos"]
    : ["carbon projects", "CarbonPlan", "Verra projects", "Gold Standard", "carbon credits projects"];

  return {
    title: t('title'),
    description: t('subtitle'),
    keywords,
    alternates: {
        canonical: `https://sintropia.space/${locale}/carbono-projetos`,
    },
  };
}

export default async function CarbonoProjetos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoProjetos' });
  const tIds = await getTranslations({ locale, namespace: 'CarbonoProjetos.projectIdDetails' });
  
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
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
            Dados atualizado diretamente do <CarbonPlanLink />.
          </p>
        </div>

        <CarbonPlanChartWrapper />

        <div className="mt-12">
          <Callout title={t('projectIds')} variant="info">
            <p className="mb-4">
              {t('projectIdsDesc')}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong className="text-blue-600 dark:text-blue-400">VCS</strong> - {tIds('vcs')}</li>
              <li><strong className="text-green-600 dark:text-green-400">CAR</strong> - {tIds('car')}</li>
              <li><strong className="text-purple-600 dark:text-purple-400">ACR</strong> - {tIds('acr')}</li>
              <li><strong className="text-orange-600 dark:text-orange-400">GLD</strong> - {tIds('gld')}</li>
              <li><strong className="text-yellow-600 dark:text-yellow-400">CDM</strong> - {tIds('cdm')}</li>
              <li><strong className="text-pink-600 dark:text-pink-400">GS</strong> - {tIds('gs')}</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-6">
          <Callout title={t('aboutData')} variant="info">
            <p className="mb-4">
              {t('aboutDataDesc')}
            </p>
            <p>
              <strong>Nota:</strong> {t('aboutDataNote')}
            </p>
          </Callout>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('download')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('downloadDesc')}
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
              {t('downloadProjects')}
            </a>
            <a
              href="/dados/CarbonPlan/credits.csv"
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('downloadCredits')}
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
