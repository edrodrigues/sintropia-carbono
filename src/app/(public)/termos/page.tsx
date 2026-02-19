import Link from "next/link";

export default function TermosPage() {
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
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-bold mb-4">
            📄 Termos de Uso
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Termos e Condições
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ao usar o Sintropia, você concorda com estes termos. Leia-os com atenção.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Última atualização: Fevereiro 2026
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. Aceitação dos Termos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ao acessar e usar o Sintropia, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Descrição do Serviço
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O Sintropia é uma plataforma de dados abertos que oferece:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Dados sobre o mercado de carbono e energia renovável</li>
            <li>Uma comunidade para discussão e compartilhamento de informações</li>
            <li>Perfis de usuário públicos</li>
            <li>Funcionalidades de postagem e interação social</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            O serviço é fornecido como projeto open source colaborativo.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. Cadastro de Conta
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Para usar certaines funcionalidades, você pode criar uma conta:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Você deve fornecer informações verdadeiras e atualizadas</li>
            <li>Você é responsável por manter a segurança da sua conta</li>
            <li>Você deve notificar imediatamente sobre qualquer uso não autorizado</li>
            <li>Você deve ter pelo menos 18 anos de idade para criar uma conta</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. Conteúdo do Usuário
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O Sintropia é uma plataforma de dados abertos. Por design:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Posts, comentários e perfis são <strong>públicos</strong> por padrão</li>
            <li>Você mantém a propriedade do conteúdo que publica</li>
            <li>Ao publicar, você nos concede licença para exibir seu conteúdo</li>
            <li>Você é responsável pelo conteúdo que publica</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            5. Condições de Uso
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você concorda em NÃO:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Publicar conteúdo ilegal, difamatório ou abusivo</li>
            <li>Usar a plataforma para atividades ilegais</li>
            <li>Tentar acessar contas de outros usuários</li>
            <li>Publicar spam ou conteúdo comercial não solicitado</li>
            <li>Infringir direitos de propriedade intelectual de terceiros</li>
            <li>Criar múltiplas contas para evadir restrições</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            6. Moderação e Suspensão
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Reservamos o direito de:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Remover conteúdo que viole estes termos</li>
            <li>Suspender ou encerrar contas infratoras</li>
            <li>Modificar ou descontinuar o serviço a qualquer momento</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            7. Isenção de Garantias
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            O serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Os dados são fornecidos para fins informativos e não constituem advice financeiro ou profissional.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            8. Limitação de Responsabilidade
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Em nenhuma circunstância seremos responsáveis por quaisquer danos indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da impossibilidade de usar o serviço.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            9. Dados de Mercado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Os dados de mercado de carbono e energia disponíveis na plataforma:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>São fornecidos apenas para fins informativos</li>
            <li>Não constituem advice financeiro ou de investimento</li>
            <li>Podem conter imprecisões e atrasos</li>
            <li>Não nos responsabilizamos por decisões baseadas nestes dados</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            10. Propriedade Intelectual
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            O Sintropia é um projeto open source. O código-fonte está disponível no GitHub sob licença MIT. Os dados públicos podem ser utilizados, desde que citada a fonte.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            11. Alterações nos Termos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Podemos revisar estes termos periodicamente. A versão mais atual estará sempre nesta página. O uso contínuo da plataforma após alterações indica sua aceitação dos novos termos.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            12. Contato
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Se você tiver dúvidas sobre estes termos, entre em contato:
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
