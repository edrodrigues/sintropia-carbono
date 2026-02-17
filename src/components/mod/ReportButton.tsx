"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ReportButtonProps {
    targetId: string;
    targetType: "post" | "comment" | "profile";
}

export function ReportButton({ targetId, targetType }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Você precisa estar logado para denunciar.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.from("reports").insert({
            reporter_id: user.id,
            target_id: targetId,
            target_type: targetType,
            reason: reason,
        });

        if (error) {
            alert("Erro ao enviar denúncia: " + error.message);
        } else {
            setSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setSubmitted(false);
                setReason("");
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors"
                title="Denunciar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                Denunciar
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Denunciar conteúdo</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {submitted ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Denúncia recebida</h3>
                                <p className="text-gray-500">Nossa equipe de moderação irá analisar o conteúdo em breve.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    Por que você está denunciando este conteúdo? Sua identidade permanecerá anônima para o autor.
                                </p>

                                <div className="space-y-2">
                                    {["Spam ou propaganda enganosa", "Discurso de ódio ou assédio", "Conteúdo ilegal", "Informação falsa/desinformação", "Outro"].map((r) => (
                                        <label
                                            key={r}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${reason === r
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={r}
                                                checked={reason === r}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${reason === r ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
                                                }`}>
                                                {reason === r && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{r}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !reason}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? "Enviando..." : "Enviar Denúncia"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
