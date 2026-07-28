"use client";

interface LastUpdatedProps {
  lastDate?: string | null;
  dataFile?: string;
  className?: string;
}

export function LastUpdated({ lastDate, className = "" }: LastUpdatedProps) {
  if (!lastDate) return null;

  const date = new Date(lastDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isStale = diffDays > 30;

  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${isStale ? "bg-yellow-400" : "bg-green-500"}`} />
      <span>
        Último dia atualizado:
        {" "}
        <strong>{formattedDate}</strong>
      </span>
    </div>
  );
}
