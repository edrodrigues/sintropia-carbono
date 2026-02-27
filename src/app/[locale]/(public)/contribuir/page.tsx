import Link from "next/link";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Contribuir' });
    
    return {
        title: locale === 'pt' ? 'Contribuir | Sintropia' : 'Contribute | Sintropia',
        description: t('heroDesc'),
        keywords: locale === 'pt'
            ? ["contribuir projeto", "open source carbono", "Sintropia GitHub", "desenvolvimento colaborativo"]
            : ["contribute project", "open source carbon", "Sintropia GitHub", "collaborative development"],
        alternates: {
            canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/' }contribuir`,
        },
    };
}

export default async function ContribuirPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Contribuir' });
    const tHow = await getTranslations({ locale, namespace: 'Contribuir.howTo' });
    const tTech = await getTranslations({ locale, namespace: 'Contribuir.techStack' });
    const tLinks = await getTranslations({ locale, namespace: 'Contribuir.footerLinks' });
  
    const techStack = [
        { name: "Next.js", desc: tTech('nextjs') },
        { name: "TypeScript", desc: tTech('typescript') },
        { name: "Tailwind CSS", desc: tTech('tailwind') },
        { name: "Supabase", desc: tTech('supabase') },
        { name: "Chart.js", desc: tTech('chartjs') },
        { name: "Prisma", desc: tTech('prisma') },
        { name: "Vercel", desc: tTech('vercel') },
        { name: "GitHub", desc: tTech('github') },
    ];
  
    return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h1 className="font-bold text-xl text-[#1e40af] dark:text-blue-400 leading-tight">
                  Sintropia
                </h1>
              </div>
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              ← {t('back')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 lg:px-16 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold mb-4">
            🚀 {t('heroBadge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('heroDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t('github.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('github.desc')}
            </p>
            <a
              href="https://github.com/edrodrigues/sintropia-carbono"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              {t('github.button')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t('docs.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('docs.desc')}
            </p>
            <a
              href="https://github.com/edrodrigues/sintropia-carbono#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              {t('docs.button')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('howToTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{tHow('report.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tHow('report.desc')}
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{tHow('suggest.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tHow('suggest.desc')}
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{tHow('code.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tHow('code.desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('techStackTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-bold text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('contact')}
          </p>
          <a
            href="https://github.com/edrodrigues/sintropia-carbono/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#1e40af] dark:text-blue-400 font-bold hover:underline"
          >
            {t('openIssue')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2026 <strong>Sintropia</strong>. {t('footer')}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/edrodrigues/sintropia-carbono"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
              >
                {tLinks('github')}
              </a>
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
              >
                {tLinks('home')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
