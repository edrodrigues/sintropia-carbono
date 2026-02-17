import Link from 'next/link';
import { signup } from '@/app/(auth)/login/actions';

export default async function RegisterPage(props: {
  searchParams: Promise<{ message: string; error: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <span className="text-4xl mb-4 block animate-bounce">🌱</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Criar sua Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Junte-se ao ecossistema Sintropia
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                Nome de Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all"
                placeholder="@joaosilva"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <label className="relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                  <input type="radio" name="user_type" value="individual" defaultChecked className="hidden" />
                  <span className="text-lg">👤</span>
                  <span className="text-[9px] font-bold uppercase">Indivíduo</span>
                </label>
                <label className="relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                  <input type="radio" name="user_type" value="company" className="hidden" />
                  <span className="text-lg">🏢</span>
                  <span className="text-[9px] font-bold uppercase">Empresa</span>
                </label>
                <label className="relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                  <input type="radio" name="user_type" value="ong" className="hidden" />
                  <span className="text-lg">🤝</span>
                  <span className="text-[9px] font-bold uppercase">ONG</span>
                </label>
                <label className="relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                  <input type="radio" name="user_type" value="government" className="hidden" />
                  <span className="text-lg">🏛️</span>
                  <span className="text-[9px] font-bold uppercase">Governo</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {searchParams?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs text-center font-bold border border-red-100 dark:border-red-800">
              ⚠️ {decodeURIComponent(searchParams.error)}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <button
              formAction={signup}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1e40af] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Criar Conta Grátis
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 font-bold tracking-widest">Sign up com</span>
              </div>
            </div>

            <button
              disabled
              type="button"
              className="group relative w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-60 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#9CA3AF"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#9CA3AF"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#9CA3AF"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
              <span className="ml-1 text-[10px] uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Em Breve</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-gray-50 dark:border-gray-800">
          <p className="text-xs text-gray-500 font-medium">
            Já possui uma conta? {' '}
            <Link href="/login" className="text-[#1e40af] dark:text-blue-400 hover:underline font-bold transition-all">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
