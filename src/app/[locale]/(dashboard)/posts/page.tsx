import { getTranslations } from 'next-intl/server';

export default async function Posts() {
  const t = await getTranslations('Posts');
  
  const posts = [
    {
      id: 1,
      title: "Análise do Mercado de Carbono em 2025",
      excerpt: "Overview dos principais desenvolvimentos no mercado voluntário de carbono...",
      author: "Maria Santos",
      date: "2026-02-15",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      title: "Novo padrão I-REC para pequenas empresas",
      excerpt: "Entenda as novas diretrizes para certificação de energia renovável...",
      author: "João Silva",
      date: "2026-02-14",
      likes: 18,
      comments: 5,
    },
    {
      id: 3,
      title: "Tendências de preços de CBIO no Brasil",
      excerpt: "Análise dos movimentos de preços dos Créditos de Descarbonização...",
      author: "Ana Oliveira",
      date: "2026-02-13",
      likes: 32,
      comments: 12,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('pageTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('pageSubtitle')}
          </p>
        </div>
        <button className="bg-[#1e40af] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          {t('newPost')}
        </button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>👤 {post.author}</span>
                <span>📅 {post.date}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
