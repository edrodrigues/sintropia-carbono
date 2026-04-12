import Link from "next/link";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    
    return {
        title: locale === 'pt' ? 'Privacidade | Sintropia' : 'Privacy | Sintropia',
        description: locale === 'pt'
            ? "Política de privacidade da plataforma Sintropia. Veja como protegemos seus dados pessoais."
            : "Privacy policy for the Sintropia platform. See how we protect your personal data.",
        keywords: locale === 'pt'
            ? ["privacidade", "proteção dados", "LGPD", "dados pessoais", "Sintropia"]
            : ["privacy", "data protection", "GDPR", "personal data", "Sintropia"],
        alternates: {
            canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/' }privacidade`,
        },
    };
}

export default async function PrivacidadePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Privacidade' });
    const tSec = await getTranslations({ locale, namespace: 'Privacidade.sections' });
    const tLinks = await getTranslations({ locale, namespace: 'Privacidade.footerLinks' });

    const sections = [
        { key: '1', title: tSec('1.title'), content: tSec('1.content'), list: [tSec('1.list.0'), tSec('1.list.1'), tSec('1.list.2')] },
        { key: '2', title: tSec('2.title'), list: [tSec('2.list.0'), tSec('2.list.1'), tSec('2.list.2'), tSec('2.list.3'), tSec('2.list.4')] },
        { key: '3', title: tSec('3.title'), content: tSec('3.content'), list: [tSec('3.list.0'), tSec('3.list.1'), tSec('3.list.2'), tSec('3.list.3')] },
        { key: '4', title: tSec('4.title'), content: tSec('4.content'), list: [tSec('4.list.0'), tSec('4.list.1'), tSec('4.list.2'), tSec('4.list.3')] },
        { key: '5', title: tSec('5.title'), content: tSec('5.content'), list: [tSec('5.list.0'), tSec('5.list.1'), tSec('5.list.2'), tSec('5.list.3')], footer: tSec('5.footer') },
        { key: '6', title: tSec('6.title'), content: tSec('6.content') },
        { key: '7', title: tSec('7.title'), content: tSec('7.content') },
        { key: '8', title: tSec('8.title'), content: tSec('8.content') },
        { key: '9', title: tSec('9.title'), content: tSec('9.content'), button: tSec('9.button') },
    ];

    return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h1 className="font-bold text-xl text-premium-blue dark:text-blue-400 leading-tight">
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
          <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold mb-4">
            🔒 {t('heroBadge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('heroDesc')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            {t('lastUpdate')}
          </p>
        </div>

        {sections.map((section) => (
            <div key={section.key} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.key}. {section.title}
                </h2>
                {section.content && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {section.content}
                    </p>
                )}
                {section.list && (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                        {section.list.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}
                {section.footer && (
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        {section.footer}
                    </p>
                )}
                {section.key === '9' && section.button && (
                    <a
                        href="https://github.com/edrodrigues/sintropia-carbono/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-premium-blue dark:text-blue-400 font-bold hover:underline"
                    >
                        {section.button}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        ))}
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2026 <strong>Sintropia</strong>. {t('footer')}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacidade"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-premium-blue dark:hover:text-blue-400 transition-colors"
              >
                {tLinks('privacidade')}
              </Link>
              <Link
                href="/termos"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-premium-blue dark:hover:text-blue-400 transition-colors"
              >
                {tLinks('termos')}
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-premium-blue dark:hover:text-blue-400 transition-colors"
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
