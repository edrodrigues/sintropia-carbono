"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [isCarbonOpen, setIsCarbonOpen] = useState(false);
  const [isComunidadeOpen, setIsComunidadeOpen] = useState(false);
  const [isContaOpen, setIsContaOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="bg-gradient-to-r from-lime-200 to-lime-300 text-gray-800 py-2 px-4 text-center text-sm">
        <span className="font-semibold">🚀 Projeto Colaborativo Open Source</span> —{" "}
        <a
          href="https://github.com/edrodrigues/sintropia-carbono"
          target="_blank"
          className="underline hover:text-lime-700 font-semibold text-lime-800"
        >
          GitHub
        </a>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h1 className="font-bold text-xl text-[#1e40af] dark:text-blue-400 leading-tight">
                  Sintropia
                </h1>
              </div>
            </Link>

            <nav className="hidden md:flex h-full items-end gap-1">
              <Link
                href="/"
                className={`px-4 py-5 text-sm font-semibold flex items-center gap-2 transition-all ${isActive("/")
                  ? "text-[#1e40af] border-b-2 border-[#1e40af] bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-300"
                  }`}
              >
                <span>🏠</span>Home
              </Link>
              <Link
                href="/certificadoras"
                className={`px-4 py-5 text-sm font-semibold flex items-center gap-2 transition-all ${isActive("/certificadoras")
                  ? "text-[#1e40af] border-b-2 border-[#1e40af] bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-300"
                  }`}
              >
                <span>🏛️</span>Certificadoras
              </Link>

              <a
                href="https://github.com/edrodrigues/sintropia-carbono"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-300 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </a>

              <div
                className="relative group h-full flex items-end"
                onMouseEnter={() => setIsEnergyOpen(true)}
                onMouseLeave={() => setIsEnergyOpen(false)}
              >
                <button className="px-4 py-5 text-sm font-semibold text-gray-500 hover:text-[#1e40af] transition-all dark:text-gray-400 dark:hover:text-blue-300 flex items-center gap-2">
                  <span>⚡</span>Energia
                  <svg
                    className={`w-4 h-4 transition-transform ${isEnergyOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`absolute top-full left-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-50 ${isEnergyOpen ? "block" : "hidden"
                    }`}
                >
                  <Link
                    href="/irec-brasil"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🇧🇷</span> Brasil
                  </Link>
                  <Link
                    href="/irec-mundo"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🌎</span> Mundo
                  </Link>
                  <Link
                    href="/irec-precos"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>💰</span> Preços
                  </Link>
                </div>
              </div>

              <div
                className="relative group h-full flex items-end"
                onMouseEnter={() => setIsCarbonOpen(true)}
                onMouseLeave={() => setIsCarbonOpen(false)}
              >
                <button className="px-4 py-5 text-sm font-semibold text-gray-500 hover:text-[#1e40af] transition-all dark:text-gray-400 dark:hover:text-blue-300 flex items-center gap-2">
                  <span>🌍</span>Carbono
                  <svg
                    className={`w-4 h-4 transition-transform ${isCarbonOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`absolute top-full left-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-50 ${isCarbonOpen ? "block" : "hidden"
                    }`}
                >
                  <Link
                    href="/carbono-brasil"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🇧🇷</span> Brasil
                  </Link>
                  <Link
                    href="/carbono-mundo"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🌎</span> Mundo
                  </Link>
                  <Link
                    href="/carbono-precos"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>💰</span> Preços
                  </Link>
                </div>
              </div>

              <div
                className="relative group h-full flex items-end"
                onMouseEnter={() => setIsComunidadeOpen(true)}
                onMouseLeave={() => setIsComunidadeOpen(false)}
              >
                <button
                  className={`px-4 py-5 text-sm font-semibold flex items-center gap-2 transition-all ${isActive("/feed") || isActive("/profile") || isActive("/leaderboard")
                    ? "text-[#1e40af] border-b-2 border-[#1e40af] bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-300"
                    }`}
                >
                  <span>💬</span>Comunidade
                  <svg
                    className={`w-4 h-4 transition-transform ${isComunidadeOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`absolute top-full left-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-50 ${isComunidadeOpen ? "block" : "hidden"
                    }`}
                >
                  <Link
                    href="/feed"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>📝</span> Posts
                  </Link>
                  <Link
                    href="/profiles"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>👥</span> Perfis
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🏆</span> Ranking
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>👤</span> Meu Perfil
                  </Link>
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                aria-label="Toggle dark mode"
              >
                <span>{isDarkMode ? "☀️" : "🌙"}</span>
              </button>

              {!loading && (
                <>
                  {user ? (
                    <div
                      className="relative group"
                      onMouseEnter={() => setIsContaOpen(true)}
                      onMouseLeave={() => setIsContaOpen(false)}
                    >
                      <button className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-[#1e40af] dark:text-blue-300 text-sm font-bold">
                        <div className="w-6 h-6 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-[10px]">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="hidden sm:inline">Minha Conta</span>
                      </button>
                      <div className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 ${isContaOpen ? 'block' : 'hidden'} transition-all transform origin-top-right`}>
                        <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Logado como</p>
                          <p className="text-xs font-semibold truncate dark:text-gray-200">{user.email}</p>
                        </div>
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700">
                          📊 Minha Página
                        </Link>
                        {(profile?.role === "moderator" || profile?.role === "admin") && (
                          <Link href="/mod" className="block px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-50 dark:border-gray-700">
                            🛡️ Moderação
                          </Link>
                        )}
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          👤 Meu Perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-gray-50 dark:border-gray-700"
                        >
                          🚪 Sair
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="px-5 py-2.5 rounded-lg bg-[#1e40af] hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      Entrar
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
