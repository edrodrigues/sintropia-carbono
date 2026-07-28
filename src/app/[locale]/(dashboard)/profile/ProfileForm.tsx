"use client";

import { useState } from "react";
import { updateProfile } from "@/app/[locale]/(dashboard)/profile/actions";

interface ProfileFormProps {
  profile: {
    username?: string | null;
    display_name?: string | null;
    bio?: string | null;
    user_type?: string | null;
    organization?: string | null;
    cargo?: string | null;
    linkedin_url?: string | null;
    twitter_url?: string | null;
    headline?: string | null;
    expertise_areas?: string[] | null;
    certifications?: string[] | null;
    years_of_experience?: number | null;
    available_for_consulting?: boolean | null;
    company_tagline?: string | null;
    company_sector?: string | null;
    company_size?: string | null;
    company_cnpj?: string | null;
    company_website?: string | null;
    company_founded_year?: number | null;
    company_geo_presence?: string | null;
  } | null;
  email: string;
}

const COMPANY_SECTORS = [
  "Energia", "Agricultura", "Finanças", "Tecnologia",
  "Transporte", "Indústria", "Construção", "Mineração",
  "Resíduos", "Consultoria", "Educação", "Outro",
];

const COMPANY_SIZES = [
  { value: "MEI", label: "MEI (Microempreendedor Individual)" },
  { value: "Pequena", label: "Pequena (até 50 funcionários)" },
  { value: "Média", label: "Média (50-500 funcionários)" },
  { value: "Grande", label: "Grande (acima de 500 funcionários)" },
];

const GEO_PRESENCE_OPTIONS = [
  "Nacional", "América Latina", "América do Norte",
  "Europa", "Ásia", "África", "Global",
];

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userType, setUserType] = useState(profile?.user_type || "individual");
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    organization: profile?.organization || "",
    cargo: profile?.cargo || "",
    linkedin_url: profile?.linkedin_url || "",
    twitter_url: profile?.twitter_url || "",
    headline: profile?.headline || "",
    expertise_areas: profile?.expertise_areas || [],
    certifications: profile?.certifications || [],
    years_of_experience: profile?.years_of_experience || null,
    available_for_consulting: profile?.available_for_consulting || false,
    company_tagline: profile?.company_tagline || "",
    company_sector: profile?.company_sector || "",
    company_size: profile?.company_size || "",
    company_cnpj: profile?.company_cnpj || "",
    company_website: profile?.company_website || "",
    company_founded_year: profile?.company_founded_year || null,
    company_geo_presence: profile?.company_geo_presence || "",
  });

  const EXPERTISE_OPTIONS = [
    "Carbon Markets", "Renewable Energy", "ESG Reporting", "Climate Policy",
    "Biodiversity", "Social Impact", "Corporate Governance", "Sustainable Finance",
    "Energy Efficiency", "Water Management", "Circular Economy", "Supply Chain",
  ];

  const CERTIFICATION_OPTIONS = [
    "GRI Certified", "SASB FSA Credential", "CFA ESG Investing",
    "ISSP Sustainability Professional", "LEED AP", "BREEAM Assessor",
    "ISO 14001 Lead Auditor", "CDP Accredited Provider",
  ];

  function toggleExpertise(area: string) {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas?.includes(area)
        ? prev.expertise_areas.filter(a => a !== area)
        : [...(prev.expertise_areas || []), area],
    }));
  }

  function toggleCertification(cert: string) {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...(prev.certifications || []), cert],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const result = await updateProfile(form);

    setLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    else {
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Tipo de Conta</label>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <label htmlFor="user_type_individual" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_individual" type="radio" name="user_type" value="individual" checked={userType === "individual"} onChange={() => setUserType("individual")} className="hidden" />
              <span className="text-xl">👤</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Indivíduo</span>
            </label>
            <label htmlFor="user_type_company" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_company" type="radio" name="user_type" value="company" checked={userType === "company"} onChange={() => setUserType("company")} className="hidden" />
              <span className="text-xl">🏢</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Empresa</span>
            </label>
            <label htmlFor="user_type_ong" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_ong" type="radio" name="user_type" value="ong" checked={userType === "ong"} onChange={() => setUserType("ong")} className="hidden" />
              <span className="text-xl">🤝</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">ONG</span>
            </label>
            <label htmlFor="user_type_government" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_government" type="radio" name="user_type" value="government" checked={userType === "government"} onChange={() => setUserType("government")} className="hidden" />
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Governo</span>
            </label>
            <label htmlFor="user_type_professor" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_professor" type="radio" name="user_type" value="professor" checked={userType === "professor"} onChange={() => setUserType("professor")} className="hidden" />
              <span className="text-xl">🧑‍🏫</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Professor</span>
            </label>
            <label htmlFor="user_type_broker" className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 has-[:checked]:border-deep-forest has-[:checked]:bg-mint-tint dark:has-[:checked]:bg-deep-forest/20">
              <input id="user_type_broker" type="radio" name="user_type" value="broker" checked={userType === "broker"} onChange={() => setUserType("broker")} className="hidden" />
              <span className="text-xl">📈</span>
              <span className="text-xs font-bold uppercase tracking-wide dark:text-gray-300">Broker</span>
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
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder="usuario"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
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
            onChange={e => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Como quer ser chamado"
            maxLength={50}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
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
            onChange={e => setFormData({ ...formData, organization: e.target.value })}
            placeholder="Ex: Empresa X, ONG Y, Universidade Z"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
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
            onChange={e => setFormData({ ...formData, cargo: e.target.value })}
            placeholder="Ex: Gerente de Sustentabilidade, Analista, Pesquisador"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="bio" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
            Bio / Sobre
            <span className="text-gray-300 font-normal ml-1">(máx. 1000)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Conte-nos um pouco sobre você ou sua empresa..."
            maxLength={1000}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin_url" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
            LinkedIn
            <span className="text-gray-300 font-normal ml-1">(URL do perfil)</span>
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            value={formData.linkedin_url}
            onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/seu-perfil"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="twitter_url" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
            Twitter / X
            <span className="text-gray-300 font-normal ml-1">(URL do perfil)</span>
          </label>
          <input
            id="twitter_url"
            name="twitter_url"
            type="url"
            value={formData.twitter_url}
            onChange={e => setFormData({ ...formData, twitter_url: e.target.value })}
            placeholder="https://x.com/seu-usuario"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      {/* Professional / Company Fields Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          {userType === "company" ? "Perfil da Empresa" : "Perfil Profissional"}
        </h3>

        {userType === "company" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="company_tagline" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Slogan / Tagline
                <span className="text-gray-300 font-normal ml-1">(máx. 150)</span>
              </label>
              <input
                id="company_tagline"
                name="company_tagline"
                type="text"
                value={formData.company_tagline || ""}
                onChange={e => setFormData({ ...formData, company_tagline: e.target.value })}
                placeholder="Ex: Líder em créditos de carbono na América Latina"
                maxLength={150}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_sector" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Setor de Atuação
              </label>
              <select
                id="company_sector"
                name="company_sector"
                value={formData.company_sector}
                onChange={e => setFormData({ ...formData, company_sector: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">Selecione um setor</option>
                {COMPANY_SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="company_size" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Porte da Empresa
              </label>
              <select
                id="company_size"
                name="company_size"
                value={formData.company_size}
                onChange={e => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">Selecione o porte</option>
                {COMPANY_SIZES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="company_cnpj" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                CNPJ
                <span className="text-gray-300 font-normal ml-1">(opcional)</span>
              </label>
              <input
                id="company_cnpj"
                name="company_cnpj"
                type="text"
                value={formData.company_cnpj || ""}
                onChange={e => setFormData({ ...formData, company_cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                maxLength={14}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_website" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Site
              </label>
              <input
                id="company_website"
                name="company_website"
                type="url"
                value={formData.company_website || ""}
                onChange={e => setFormData({ ...formData, company_website: e.target.value })}
                placeholder="https://www.exemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_founded_year" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Ano de Fundação
              </label>
              <input
                id="company_founded_year"
                name="company_founded_year"
                type="number"
                min={1900}
                max={2026}
                value={formData.company_founded_year ?? ""}
                onChange={e => setFormData({ ...formData, company_founded_year: e.target.value ? Number(e.target.value) : null })}
                placeholder="ex: 2010"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_geo_presence" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Presença Geográfica
              </label>
              <select
                id="company_geo_presence"
                name="company_geo_presence"
                value={formData.company_geo_presence}
                onChange={e => setFormData({ ...formData, company_geo_presence: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">Selecione a abrangência</option>
                {GEO_PRESENCE_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="headline" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Headline / Título Profissional
                <span className="text-gray-300 font-normal ml-1">(máx. 150)</span>
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                value={formData.headline || ""}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Ex: Carbon Markets Analyst | ESG Specialist"
                maxLength={150}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Áreas de Especialização
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleExpertise(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      formData.expertise_areas?.includes(area)
                        ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-emerald-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <input type="hidden" name="expertise_areas" value={JSON.stringify(formData.expertise_areas)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Certificações
              </label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATION_OPTIONS.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCertification(cert)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      formData.certifications?.includes(cert)
                        ? "bg-blue-100 text-blue-800 border-2 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-blue-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
              <input type="hidden" name="certifications" value={JSON.stringify(formData.certifications)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="years_of_experience" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Anos de Experiência
              </label>
              <input
                id="years_of_experience"
                name="years_of_experience"
                type="number"
                min={0}
                max={70}
                value={formData.years_of_experience ?? ""}
                onChange={e => setFormData({ ...formData, years_of_experience: e.target.value ? Number(e.target.value) : null })}
                placeholder="ex: 5"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-deep-forest focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full">
                <input
                  type="checkbox"
                  name="available_for_consulting"
                  checked={formData.available_for_consulting}
                  onChange={e => setFormData({ ...formData, available_for_consulting: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Disponível para Consultoria</span>
                  <p className="text-xs text-gray-400">Mostrar que você está aberto a oportunidades de consultoria</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800"
        }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-deep-forest text-white font-bold shadow-lg shadow-deep-forest/25 transition-all hover:bg-charcoal-ink active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
