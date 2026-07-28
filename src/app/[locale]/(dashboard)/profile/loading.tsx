export default function ProfileLoading() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 animate-pulse">
      {/* Profile header skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 rounded-3xl bg-white/20" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-white/20 rounded-lg" />
            <div className="h-4 w-32 bg-white/20 rounded-lg" />
            <div className="h-4 w-64 bg-white/20 rounded-lg" />
            <div className="h-3 w-full bg-white/20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Posts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
            <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="flex gap-4">
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
