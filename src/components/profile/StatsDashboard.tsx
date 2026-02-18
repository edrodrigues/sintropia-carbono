"use client";

interface StatsDashboardProps {
  stats: {
    posts: number;
    comments: number;
    upvotes: number;
    ranking?: number;
  };
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.posts}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.comments}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comentários</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.upvotes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upvotes</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.ranking ? `#${stats.ranking}` : "-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ranking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
