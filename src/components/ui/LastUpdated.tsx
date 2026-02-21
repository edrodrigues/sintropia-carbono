"use client";

import { useState, useEffect } from "react";

interface LastUpdatedProps {
  dataFile: string;
  className?: string;
}

export function LastUpdated({ dataFile, className = "" }: LastUpdatedProps) {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    // Try to get the last modified date from the file
    // In a real scenario, this would be fetched from the server
    // For now, we'll use a static date based on the file
    const fileDates: Record<string, string> = {
      "carbono-brasil": "2026-02-15",
      "carbono-mundo": "2026-02-15",
      "carbono-precos": "2026-02-15",
      "irec-brasil": "2026-02-15",
      "irec-mundo": "2026-02-15",
      "irec-precos": "2026-02-15",
      "certificadoras": "2026-02-21",
    };

    const dateStr = fileDates[dataFile] || "2026-02-15";
    const date = new Date(dateStr);
    
    // Format the date
    const formattedDate = date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setLastUpdated(formattedDate);

    // Check if data is stale (> 30 days old)
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setIsStale(diffDays > 30);
  }, [dataFile]);

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${isStale ? "bg-yellow-400" : "bg-green-500"}`} />
      <span>
        Atualizado em: <strong>{lastUpdated}</strong>
      </span>
    </div>
  );
}
