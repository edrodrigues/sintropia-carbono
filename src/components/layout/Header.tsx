"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { StreakDisplay } from "@/components/gamification/StreakBadge";
import { Tooltip } from "@/components/ui/Tooltip";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<number>(0);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);

        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("current_streak")
          .eq("user_id", user.id)
          .maybeSingle();
        setStreak(streakData?.current_streak || 0);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const menuItems = [
    { label: "Certificadoras", href: "/certificadoras" },
    {
      label: "Energia",
      href: "/irec-brasil",
      subItems: [
        { label: "Mercado Brasil", href: "/irec-brasil", desc: "Veja quem são os maiores compradores de certificados I-REC no Brasil." },
        { label: "Mercado Global", href: "/irec-mundo", desc: "Veja quem são os maiores compradores de certificados I-REC no Mundo." },
        { label: "Preços", href: "/irec-precos", desc: "Confirme os preços dos certificados I-REC de forma comparada entre os mercados." },
      ]
    },
    {
      label: "Carbono",
      href: "/carbono-brasil",
      subItems: [
        { label: "Mercado Brasil", href: "/carbono-brasil", desc: "Veja quem são os maiores compradores de créditos de carbono no Brasil." },
        { label: "Mercado Mundo", href: "/carbono-mundo", desc: "Veja quem são os maiores compradores de créditos de carbono no mundo." },
        { label: "Preços", href: "/carbono-precos", desc: "Análise comparada e evolução dos preços" },
        { label: "Dados dos Projetos", href: "/carbono-projetos", desc: "Dados sobre 7700+ Projetos de carbono." },
      ]
    },
    {
      label: "Comunidade",
      href: "/feed",
      subItems: [
        { label: "Feed de Notícias", href: "/feed", desc: "Insights e posts da nossa rede de especialistas." },
        { label: "Perfis da Comunidade", href: "/profiles", desc: "Veja todos os perfis da comunidade." },
        { label: "Ranking de Membros", href: "/leaderboard", desc: "Veja quem são os maiores contribuidores." },
        { label: "Minhas Missões", href: "/conquistas", desc: "Ganhe karma e suba de nível na plataforma." },
      ]
    },
  ];

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveMenu(activeMenu === idx ? null : idx);
    }
    if (e.key === 'Escape') {
      setActiveMenu(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 w-full" onMouseLeave={() => { setActiveMenu(null); setShowProfileMenu(false); }}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-forest-green flex items-center justify-center shadow-premium group-hover:bg-emerald-700 transition-colors">
            <span className="text-white text-xl">🌱</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-forest-green">SINTROPIA</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-2 h-full" role="navigation" aria-label="Menu principal">
          {menuItems.map((item, idx) => (
            <div
              key={item.href}
              className="relative h-full flex items-center"
              onMouseEnter={() => { setActiveMenu(idx); setShowProfileMenu(false); }}
              onFocus={() => { setActiveMenu(idx); setShowProfileMenu(false); }}
            >
              <Link
                href={item.href}
                aria-expanded={item.subItems ? activeMenu === idx : undefined}
                aria-haspopup={item.subItems ? "true" : undefined}
                onKeyDown={(e) => item.subItems && handleKeyDown(e, idx)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold tracking-wide transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 ${pathname === item.href || (item.subItems?.some(s => pathname === s.href))
                  ? "text-forest-green bg-emerald-50/50"
                  : "text-slate-500 hover:text-forest-green hover:bg-slate-50"
                  }`}
              >
                {item.label}
                {item.subItems && (
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === idx ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>

              {/* Dropdown Menu */}
              {item.subItems && activeMenu === idx && (
                <div 
                  className="absolute top-[calc(100%-10px)] left-0 w-72 bg-white rounded-2xl shadow-premium-lg border border-slate-100 p-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  role="menu"
                >
                  <div className="space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        role="menuitem"
                        className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors group/sub"
                      >
                        <span className="text-[13px] font-bold text-slate-900 group-hover/sub:text-forest-green group-focus/sub:text-forest-green transition-colors">{sub.label}</span>
                        {sub.desc && <span className="text-[11px] text-slate-400 font-medium leading-tight">{sub.desc}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">

          {/* Streak */}
          {user && streak > 0 && <StreakDisplay currentStreak={streak} />}

          {/* Post Button */}
          <Tooltip content="Compartilhe insights ou notícias com a comunidade">
            <button
              onClick={() => router.push(user ? "/feed?create=true" : "/login")}
              className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-all active:scale-95 group"
            >
              <div className="w-4 h-4 text-slate-900 group-hover:text-forest-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-slate-900">Novo Post</span>
            </button>
          </Tooltip>

          {/* Auth / Account */}
          {!loading && (
            user ? (
              <div className="relative" onMouseEnter={() => { setShowProfileMenu(true); setActiveMenu(null); }} onFocus={() => { setShowProfileMenu(true); setActiveMenu(null); }}>
                <Link
                  href="/dashboard"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                  className="bg-forest-green hover:bg-emerald-900 text-white rounded-lg px-6 py-2 text-[13px] font-bold shadow-premium transition-all active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2"
                >
                  Painel
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute top-[calc(100%+5px)] right-0 w-64 bg-white rounded-2xl shadow-premium-lg border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200" role="menu">
                    <div className="p-3 mb-2 border-b border-slate-50">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Logado como</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{profile?.display_name || user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Meu Painel
                      </Link>
                      <Link
                        href={`/u/${profile?.username}`}
                        role="menuitem"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Meu Perfil
                      </Link>
                      <Link
                        href="/conquistas"
                        role="menuitem"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                        Conquistas
                      </Link>
                      <Link
                        href="/profile/edit"
                        role="menuitem"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Editar Perfil
                      </Link>
                      <div className="h-px bg-slate-50 my-1" />
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-[13px] font-bold text-red-500 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-forest-green hover:bg-emerald-900 text-white rounded-lg px-6 py-2 text-[13px] font-bold shadow-premium transition-all active:scale-95"
              >
                Entrar
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
