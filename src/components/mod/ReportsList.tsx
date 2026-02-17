"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Report } from "@/types";
import { BanUserButton } from "./BanUserButton";

interface ReportsListProps {
  reports: Report[];
}

export function ReportsList({ reports }: ReportsListProps) {
  const supabase = createClient();
  const [localReports, setLocalReports] = useState(reports);

  const handleResolve = async (reportId: string, action: "dismissed" | "resolved") => {
    await supabase
      .from("reports")
      .update({ status: action })
      .eq("id", reportId);

    setLocalReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleDeleteContent = async (report: Report) => {
    if (report.target_type === "post") {
      await supabase
        .from("posts")
        .update({ is_deleted: true })
        .eq("id", report.target_id);
    } else if (report.target_type === "comment") {
      await supabase
        .from("comments")
        .update({ is_deleted: true })
        .eq("id", report.target_id);
    }

    await handleResolve(report.id, "resolved");
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case "post":
        return "Post";
      case "comment":
        return "Comentário";
      case "profile":
        return "Perfil";
      default:
        return type;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      "Spam ou propaganda enganosa": "Spam",
      "Discurso de ódio ou assédio": "Assédio",
      "Conteúdo ilegal": "Ilegal",
      "Informação falsa/desinformação": "Fake News",
    };
    return reasons[reason] || reason;
  };

  if (localReports.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3 opacity-30">✅</div>
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma denúncia pendente
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {localReports.map((report) => (
        <div key={report.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded">
                  {getTargetTypeLabel(report.target_type)}
                </span>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded">
                  {getReasonLabel(report.reason)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                {report.reason}
              </p>
              <p className="text-xs text-gray-400">
                Denunciado por @{report.reporter?.username || "Anônimo"} •{" "}
                {new Date(report.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDeleteContent(report)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={() => handleResolve(report.id, "dismissed")}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors"
              >
                Ignorar
              </button>
            </div>
          </div>
          {report.target_type === "post" && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <a
                href={`/posts?highlight=${report.target_id}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver conteúdo →
              </a>
            </div>
          )}
          {report.target_type === "profile" && (
            <div className="mt-3">
              <BanUserButton userId={report.target_id} username="Usuário" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
