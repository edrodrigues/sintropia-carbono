import Link from 'next/link';
import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: "Criar Conta | Sintropia",
  robots: {
    index: false,
    follow: false,
  },
};

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
            Junte-se ao Sintropia
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Dados de carbono e energia, completamente grátis.
          </p>
        </div>

        <RegisterForm error={searchParams?.error} />

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
