"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sanitizeInput, sanitizeUrl } from "@/lib/utils/sanitize";

export function CreatePostButton({ onPostCreated }: { onPostCreated?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState("news");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("O título é obrigatório");
            return;
        }

        if (trimmedTitle.length > 200) {
            setError("O título deve ter no máximo 200 caracteres");
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        // Sanitize inputs
        const sanitizedTitle = sanitizeInput(trimmedTitle);
        const sanitizedContent = content.trim() ? sanitizeInput(content.trim()) : null;
        const sanitizedUrl = url.trim() ? sanitizeUrl(url.trim()) : null;

        setLoading(true);
        const { error: insertError } = await supabase.from("posts").insert({
            author_id: user.id,
            title: sanitizedTitle,
            content: sanitizedContent,
            url: sanitizedUrl,
            category,
            keywords: keywords.length > 0 ? keywords : null,
        });

        if (insertError) {
            setError("Erro ao criar post: " + insertError.message);
        } else {
            setIsOpen(false);
            setTitle("");
            setContent("");
            setUrl("");
            setKeywords([]);
            setKeywordInput("");
            setError(null);
            router.refresh();
            onPostCreated?.();
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-500 transition-all text-gray-400 group"
            >
                <span className="font-medium group-hover:text-blue-500">O que está acontecendo no mercado hoje?</span>
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                </div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Novo Post</h2>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setError(null);
                                    setKeywords([]);
                                    setKeywordInput("");
                                }}
                                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Título do seu post"
                                    maxLength={200}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {title.length}/200
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">URL (opcional)</label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="news">Notícias</option>
                                    <option value="discussion">Discussão</option>
                                    <option value="question">Dúvida</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Palavras-chave
                                </label>
                                <div className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg"
                                            >
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => setKeywords(keywords.filter((_, i) => i !== index))}
                                                    className="hover:text-blue-900 dark:hover:text-blue-100"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const trimmed = keywordInput.trim().toLowerCase();
                                                if (trimmed && !keywords.includes(trimmed)) {
                                                    setKeywords([...keywords, trimmed]);
                                                    setKeywordInput("");
                                                }
                                            }
                                        }}
                                        placeholder="Digite e pressione Enter para adicionar"
                                        className="w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Pressione Enter para separar as palavras-chave
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Conteúdo</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Opcional. Adicione mais detalhes..."
                                    maxLength={2000}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {content.length}/2000
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setError(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Postando..." : "Criar Post"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
