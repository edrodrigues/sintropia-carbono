interface DataSource {
  name: string;
  url: string;
  type?: string;
}

interface DownloadFile {
  name: string;
  path: string;
}

interface DataSourcesProps {
  sources: DataSource[];
  className?: string;
  downloadFile?: DownloadFile;
}

export function DataSources({ sources, className = "", downloadFile }: DataSourcesProps) {
  return (
    <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
        Fontes de Dados
      </h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {source.name}
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
        {downloadFile && (
          <a
            href={downloadFile.path}
            download={downloadFile.name}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar dados completos
          </a>
        )}
      </div>
    </div>
  );
}
