import Link from "next/link";

export default function PrivacidadePage() {
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
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 lg:px-16 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold mb-4">
            🔒 Política de Privacidade
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sua Privacidade é Importante
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Esta política descreve como coletamos, usamos e protegemos suas informações.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Última atualização: Fevereiro 2026
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. Informações que Coletamos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O Sintropia é uma plataforma de dados abertos. Coletamos as seguintes informações:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Dados públicos:</strong> username, bio, avatar e posts que você escolhe compartilhar publicamente</li>
            <li><strong>Dados de autenticação:</strong> email e senha (criptografados) para conta no site</li>
            <li><strong>Dados de uso:</strong> informações anônimas sobre como você interage com a plataforma</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Como Usamos suas Informações
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Fornecer e manter nossos serviços</li>
            <li>Autenticar sua conta e permitir login</li>
            <li>Publicar seu conteúdo (posts, comentários) de forma pública</li>
            <li>Melhorar e personalizar sua experiência na plataforma</li>
            <li>Enviar comunicados importantes sobre a plataforma</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. Compartilhamento de Dados
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O Sintropia é uma plataforma de dados abertos. Por padrão:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Seus posts, perfil e atividades são <strong>públicos</strong> por design</li>
            <li>Não vendemos seus dados pessoais a terceiros</li>
            <li>Podemos compartilhar dados agregados e anonimizados para fins estatísticos</li>
            <li>Apenas compartilhamos dados pessoais quando exigido por lei</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. Segurança
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Implementamos medidas de segurança apropriadas para proteger suas informações:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Senhas armazenadas com hash e criptografia</li>
            <li>Conexões criptografadas via HTTPS</li>
            <li>Acesso restrito a dados pessoais</li>
            <li>Monitoramento contínuo de segurança</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            5. Seus Direitos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você tem os seguintes direitos sobre seus dados:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
            <li><strong>Correção:</strong> Solicitar correção de dados incorretos</li>
            <li><strong>Exclusão:</strong> Solicitar exclusão da sua conta e dados</li>
            <li><strong>Portabilidade:</strong> Solicitar seus dados em formato legível</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Para exercer esses direitos, entre em contato através do GitHub.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            6. Cookies
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Utilizamos cookies essenciais para autenticação e preferências. Você pode desativar cookies no seu navegador, mas isso pode afetar algumas funcionalidades do site.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            7. Crianças
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
           Nosso serviço não é destinado a menores de 13 anos. Não coletamos intencionalmente informações de crianças.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            8. Alterações
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas através do site. A versão mais atualizada estará sempre disponível nesta página.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            9. Contato
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Se você tiver dúvidas sobre esta política, entre em contato:
          </p>
          <a
            href="https://github.com/edrodrigues/sintropia-carbono/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#1e40af] dark:text-blue-400 font-bold hover:underline"
          >
            Abrir Issue no GitHub
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
              © 2026 <strong>Sintropia</strong>. Projeto open source colaborativo.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacidade"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
