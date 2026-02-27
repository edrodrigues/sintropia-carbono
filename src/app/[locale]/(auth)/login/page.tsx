import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { login } from '@/app/[locale]/(auth)/login/actions';
import { GoogleButton } from '@/components/GoogleButton';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Auth'
  });
  const title = params.locale === 'pt' ? 'Entrar | Sintropia' : 'Log In | Sintropia';
  
  return {
    title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🌱</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('loginTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('loginSubtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('emailLabel')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1e40af] focus:border-[#1e40af] focus:z-10 sm:text-sm dark:bg-gray-800"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('passwordLabel')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#1e40af] hover:underline font-bold"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1e40af] focus:border-[#1e40af] focus:z-10 sm:text-sm dark:bg-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          {searchParams?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-800">
              {searchParams.error}
            </div>
          )}

          {searchParams?.message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm text-center font-medium border border-blue-100 dark:border-blue-800">
              {searchParams.message}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              formAction={login}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1e40af] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25"
            >
              {t('loginButton')}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 font-bold">{t('orContinueWith')}</span>
              </div>
            </div>

            <GoogleButton />

            <div className="mt-2 text-xs text-center text-gray-500 font-semibold block">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                {t('createAccount')}
              </Link>
            </div>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
