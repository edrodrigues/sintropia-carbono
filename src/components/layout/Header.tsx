"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { StreakDisplay } from "@/components/gamification/StreakBadge";
import { Tooltip } from "@/components/ui/Tooltip";
import LanguageSwitcher from "./LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  const tNav = useTranslations('Navigation');
  const tHeader = useTranslations('Header');

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

  // Handle body scroll locking
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const menuItems = [
    { label: tNav('certificadoras'), href: "/certificadoras" },
    {
      label: tNav('energy'),
      href: "/irec-brasil",
      subItems: [
        { label: tNav('marketBrazil'), href: "/irec-brasil", desc: tNav('energyDesc.marketBrazil') },
        { label: tNav('marketWorld'), href: "/irec-mundo", desc: tNav('energyDesc.marketWorld') },
        { label: tNav('prices'), href: "/irec-precos", desc: tNav('energyDesc.prices') },
      ]
    },
    {
      label: tNav('carbon'),
      href: "/carbono-brasil",
      subItems: [
        { label: tNav('marketBrazilCarbon'), href: "/carbono-brasil", desc: tNav('carbonDesc.marketBrazil') },
        { label: tNav('marketWorldCarbon'), href: "/carbono-mundo", desc: tNav('carbonDesc.marketWorld') },
        { label: tNav('carbonPrices'), href: "/carbono-precos", desc: tNav('carbonDesc.prices') },
        { label: tNav('carbonData'), href: "/carbono-projetos", desc: tNav('carbonDesc.data') },
      ]
    },
    {
      label: tNav('community'),
      href: "/feed",
      subItems: [
        { label: tNav('newsFeed'), href: "/feed", desc: tNav('communityDesc.newsFeed') },
        { label: tNav('communityProfiles'), href: "/profiles", desc: tNav('communityDesc.profiles') },
        { label: tNav('ranking'), href: "/leaderboard", desc: tNav('communityDesc.ranking') },
        { label: tNav('missions'), href: "/conquistas", desc: tNav('communityDesc.missions') },
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
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 w-full" onMouseLeave={() => { setActiveMenu(null); setShowProfileMenu(false); }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-forest-green flex items-center justify-center shadow-premium group-hover:bg-emerald-700 transition-colors">
              <span className="text-white text-lg lg:text-xl">🌱</span>
            </div>
            <span className="font-bold text-xl lg:text-2xl tracking-tight text-forest-green">SINTROPIA</span>
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
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">

            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-forest-green hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Streak */}
            {user && streak > 0 && <StreakDisplay currentStreak={streak} />}

            {/* Post Button */}
            <Tooltip content={tHeader('newPostTooltip')}>
              <button
                onClick={() => router.push(user ? "/feed?create=true" : "/login")}
                className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 lg:px-4 py-2 hover:bg-slate-50 transition-all active:scale-95 group"
              >
                <div className="w-4 h-4 text-slate-900 group-hover:text-forest-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <span className="hidden sm:inline text-[13px] font-bold text-slate-900">{tHeader('newPost')}</span>
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
                    {tHeader('dashboard')}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute top-[calc(100%+5px)] right-0 w-64 bg-white rounded-2xl shadow-premium-lg border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200" role="menu">
                      <div className="p-3 mb-2 border-b border-slate-50">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{tHeader('loggedAs')}</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{profile?.display_name || user.email}</p>
                      </div>
                      <div className="space-y-1">
                        {profile?.role === 'moderator' || profile?.role === 'admin' ? (
                          <>
                            <Link
                              href="/mod"
                              role="menuitem"
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              {tHeader('moderation')}
                            </Link>
                            <div className="h-px bg-slate-50 my-1" />
                          </>
                        ) : null}
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          {tHeader('myPanel')}
                        </Link>
                        <Link
                          href={`/u/${profile?.username}`}
                          role="menuitem"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {tHeader('myProfile')}
                        </Link>
                        <Link
                          href="/profile/edit"
                          role="menuitem"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          {tHeader('editProfile')}
                        </Link>
                        <Link
                          href="/conquistas"
                          role="menuitem"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-green transition-colors text-[13px] font-bold text-slate-700 hover:text-forest-green"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                          {tHeader('achievements')}
                        </Link>
                        <div className="h-px bg-slate-50 my-1" />
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-[13px] font-bold text-red-500 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          {tHeader('logout')}
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
                  {tHeader('login')}
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Portal - Outside sticky/blur parent */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setMobileMenuOpen(false); setActiveSubmenu(null); }}
          />

          {/* Drawer */}
          <div className="absolute top-0 right-0 h-[100dvh] w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => { setMobileMenuOpen(false); setActiveSubmenu(null); }}
              >
                <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center">
                  <span className="text-white text-lg">🌱</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-forest-green">SINTROPIA</span>
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); setActiveSubmenu(null); }}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4" role="navigation" aria-label="Menu mobile">
              <div className="space-y-1">
                {/* Mobile Language Switcher */}
                <div className="mb-4 px-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Idioma</p>
                  <LanguageSwitcher />
                </div>

                {menuItems.map((item, idx) => (
                  <div key={item.href}>
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() => setActiveSubmenu(activeSubmenu === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-bold text-sm">{item.label}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${activeSubmenu === idx ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {activeSubmenu === idx && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-4">
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block p-3 rounded-lg text-slate-600 hover:text-forest-green hover:bg-emerald-50 transition-colors text-sm"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block p-3 rounded-xl transition-colors ${pathname === item.href
                          ? "text-forest-green bg-emerald-50 font-bold text-sm"
                          : "text-slate-700 hover:bg-slate-50 text-sm font-medium"
                          }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Auth Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                {!loading && (
                  user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-forest-green flex items-center justify-center text-white font-bold">
                          {(profile?.display_name || user.email || "U")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{profile?.display_name || user.email}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {profile?.role === 'moderator' || profile?.role === 'admin' ? (
                          <Link href="/mod" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">{tHeader('moderation')}</Link>
                        ) : null}
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">{tHeader('myPanel')}</Link>
                        <Link href={`/u/${profile?.username}`} onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">{tHeader('myProfile')}</Link>
                        <Link href="/profile/edit" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">{tHeader('editProfile')}</Link>
                        <Link href="/conquistas" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">{tHeader('achievements')}</Link>
                        <button onClick={handleLogout} className="w-full text-left p-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium">{tHeader('logout')}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full p-3 text-center border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
                      >
                        {tHeader('login')}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full p-3 text-center bg-forest-green text-white rounded-xl text-sm font-bold hover:bg-emerald-900 transition-colors"
                      >
                        {tHeader('register')}
                      </Link>
                    </div>
                  )
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
