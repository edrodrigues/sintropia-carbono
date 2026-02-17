'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/(dashboard)/profile/actions';

interface ProfileFormProps {
    profile: {
        username?: string;
        display_name?: string;
        bio?: string;
        user_type?: string;
        organization?: string;
        cargo?: string;
    } | null;
    email: string
}

export default function ProfileForm({
    profile,
    email
}: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        username: profile?.username || '',
        display_name: profile?.display_name || '',
        bio: profile?.bio || '',
        organization: profile?.organization || '',
        cargo: profile?.cargo || '',
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const form = new FormData(e.currentTarget);
        const result = await updateProfile(form);

        setLoading(false);
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Tipo de Conta</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <input type="radio" name="user_type" value="individual" defaultChecked={!profile?.user_type || profile?.user_type === 'individual'} className="hidden" />
                            <span className="text-xl">👤</span>
                            <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Indivíduo</span>
                        </label>
                        <label className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <input type="radio" name="user_type" value="company" defaultChecked={profile?.user_type === 'company'} className="hidden" />
                            <span className="text-xl">🏢</span>
                            <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Empresa</span>
                        </label>
                        <label className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <input type="radio" name="user_type" value="ong" defaultChecked={profile?.user_type === 'ong'} className="hidden" />
                            <span className="text-xl">🤝</span>
                            <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">ONG</span>
                        </label>
                        <label className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-[#1e40af] has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <input type="radio" name="user_type" value="government" defaultChecked={profile?.user_type === 'government'} className="hidden" />
                            <span className="text-xl">🏛️</span>
                            <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Governo</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">E-mail (Privado)</label>
                    <input
                        type="text"
                        disabled
                        value={email}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 cursor-not-allowed text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        Nome de Usuário
                        <span className="text-gray-300 font-normal ml-1">(3-30 caracteres)</span>
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="usuario"
                        maxLength={30}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="display_name" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        Nome de Exibição
                        <span className="text-gray-300 font-normal ml-1">(máx. 50)</span>
                    </label>
                    <input
                        id="display_name"
                        name="display_name"
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="Como quer ser chamado"
                        maxLength={50}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="organization" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        Organização
                        <span className="text-gray-300 font-normal ml-1">(empresa, ONG, etc.)</span>
                    </label>
                    <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Ex: Empresa X, ONG Y, Universidade Z"
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="cargo" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        Cargo
                        <span className="text-gray-300 font-normal ml-1">(sua função)</span>
                    </label>
                    <input
                        id="cargo"
                        name="cargo"
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        placeholder="Ex: Gerente de Sustentabilidade, Analista, Pesquisador"
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label htmlFor="bio" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        Bio / Sobre
                        <span className="text-gray-300 font-normal ml-1">(máx. 500)</span>
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Conte-nos um pouco sobre você ou sua empresa..."
                        maxLength={500}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                    />
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl bg-[#1e40af] text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100`}
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
}
