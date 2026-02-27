import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { RegisterForm } from '@/components/auth/RegisterForm';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const title = params.locale === 'pt' ? 'Criar Conta | Sintropia' : 'Create Account | Sintropia';
  
  return {
    title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RegisterPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ message: string; error: string }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <span className="text-4xl mb-4 block animate-bounce">🌱</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('registerTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('registerSubtitle')}
          </p>
        </div>

        <RegisterForm error={searchParams?.error} />

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
