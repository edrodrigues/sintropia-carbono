"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sanitizeInput } from "@/lib/utils/sanitize";
import { CHALLENGE_CATEGORIES } from "@/types";

const MAX_IMAGES = 3;

export function CreateChallengeButton({ onChallengeCreated }: { onChallengeCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [reward, setReward] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companySector, setCompanySector] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, company_sector")
          .eq("id", user.id)
          .single();
        setIsCompany(profile?.user_type === "company");
        if (profile?.company_sector) {
          setCompanySector(profile.company_sector);
        }
      }
    };
    checkUser();
  }, [supabase]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;

    files.slice(0, remaining).forEach(file => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setImages(prev => [...prev, { file, preview }]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (authorId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of images) {
      const ext = img.file.name.split(".").pop() || "png";
      const filePath = `${authorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("challenge-images")
        .upload(filePath, img.file, {
          contentType: img.file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error("Erro ao enviar imagem: " + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("challenge-images")
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("O título é obrigatório"); return; }
    if (!category) { setError("Selecione uma categoria"); return; }
    if (!context.trim()) { setError("O contexto é obrigatório"); return; }
    if (!expectedResult.trim()) { setError("O resultado esperado é obrigatório"); return; }
    if (!reward.trim()) { setError("O incentivo/recompensa é obrigatório"); return; }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, user_type")
      .eq("id", user.id)
      .single();

    if (profile?.role === "banned") {
      setError("Sua conta foi banida.");
      return;
    }

    if (profile?.user_type !== "company") {
      setError("Apenas perfis do tipo Empresa podem criar desafios.");
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(user.id);
      }

      const sanitizedTitle = sanitizeInput(title.trim());
      const sanitizedContext = sanitizeInput(context.trim());
      const sanitizedExpected = sanitizeInput(expectedResult.trim());
      const sanitizedReward = sanitizeInput(reward.trim());

      const { error: insertError } = await supabase.from("challenges").insert({
        author_id: user.id,
        title: sanitizedTitle,
        category,
        sector: companySector || null,
        context: sanitizedContext,
        expected_result: sanitizedExpected,
        reward: sanitizedReward,
        images: imageUrls.length > 0 ? imageUrls : [],
      });

      if (insertError) throw new Error(insertError.message);

      setIsOpen(false);
      setTitle("");
      setCategory("");
      setContext("");
      setExpectedResult("");
      setReward("");
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setError(null);
      router.refresh();
      onChallengeCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar desafio");
    } finally {
      setLoading(false);
    }
  };

  if (!isCompany) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm hover:border-emerald-500 transition-all text-emerald-700 dark:text-emerald-300 group"
        aria-label="Criar novo desafio"
      >
        <span className="font-medium group-hover:text-emerald-600">Sua empresa tem um desafio ambiental? Lance um Desafio!</span>
        <div className="bg-emerald-600 p-2 rounded-xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setError(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Criar Desafio Ambiental</h2>
              <button
                onClick={() => { setIsOpen(false); setError(null); }}
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                aria-label="Fechar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Título do Desafio</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Como reduzir emissões na nossa cadeia logística?"
                  maxLength={200}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">{title.length}/200</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {CHALLENGE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                        category === cat
                          ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {companySector && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Setor da empresa</span>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">{companySector}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">O Problema (Contexto)</label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Descreva detalhadamente o problema ou desafio ambiental que sua empresa enfrenta..."
                  maxLength={3000}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-32 resize-none"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">{context.length}/3000</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Resultado Esperado</label>
                <textarea
                  value={expectedResult}
                  onChange={e => setExpectedResult(e.target.value)}
                  placeholder="O que sua empresa espera alcançar com a solução deste desafio?"
                  maxLength={2000}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">{expectedResult.length}/2000</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Incentivo / Recompensa</label>
                <textarea
                  value={reward}
                  onChange={e => setReward(e.target.value)}
                  placeholder="Ex: Mentoria com nossa equipe de sustentabilidade, vale-presente, reconhecimento público, ou o que sua empresa oferece."
                  maxLength={1000}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">{reward.length}/1000</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Imagens (opcional, até {MAX_IMAGES})</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        aria-label="Remover imagem"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-xs">Upload</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setError(null); }}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Criando..." : "Criar Desafio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
