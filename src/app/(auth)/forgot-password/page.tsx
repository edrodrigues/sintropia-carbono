import Link from 'next/link';
import { resetPassword } from '@/app/(auth)/login/actions';

export default async function ForgotPasswordPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <span className="text-4xl mb-4 block">🔑</span>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Recuperar Senha
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Informe seu e-mail e enviaremos um link para criar uma nova senha.
                    </p>
                </div>

                <form className="mt-8 space-y-6">
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

                    {searchParams?.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs text-center font-bold border border-red-100 dark:border-red-800">
                            ⚠️ {decodeURIComponent(searchParams.error as string)}
                        </div>
                    )}

                    {searchParams?.message && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs text-center font-bold border border-blue-100 dark:border-blue-800">
                            ✨ {decodeURIComponent(searchParams.message as string)}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <button
                            formAction={resetPassword}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1e40af] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            Enviar Link de Recuperação
                        </button>
                    </div>
                </form>

                <div className="text-center pt-4 border-t border-gray-50 dark:border-gray-800">
                    <Link href="/login" className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-bold">
                        ← Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
