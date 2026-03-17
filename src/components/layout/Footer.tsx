"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const tFooter = useTranslations('Footer');
  const tNav = useTranslations('Navigation');

  return (
    <footer className="bg-slate-950 text-white pt-12 lg:pt-20 pb-8 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 lg:mb-20">
          {/* Brand Info */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-xl">🌱</span>
              </div>
              <span className="font-bold text-2xl tracking-tight">SINTROPIA</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {tFooter('tagline')}
            </p>
            <div className="flex gap-4">
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/future-ready-labs-br" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all group">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              {/* Twitter / X */}
              <a href="https://x.com/sintropyspace" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all group">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/edrodrigues/sintropia-carbono" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all group">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>

          {/* Energia */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-300">{tNav('energy')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/energia/ranking-brasil" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('marketBrazil')}</Link></li>
              <li><Link href="/energia/ranking-mundo" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('marketWorld')}</Link></li>
              <li><Link href="/energia/setores" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('sectors')}</Link></li>
              <li><Link href="/energia/precos" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('prices')}</Link></li>
              <li><Link href="/certificadoras" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('certificadoras')}</Link></li>
            </ul>
          </div>

          {/* Carbono */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-300">{tNav('carbon')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/carbono/ranking-brasil" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('marketBrazilCarbon')}</Link></li>
              <li><Link href="/carbono/ranking-mundo" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('marketWorldCarbon')}</Link></li>
              <li><Link href="/carbono/setores" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('carbonSectors')}</Link></li>
              <li><Link href="/carbono/precos" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('carbonPrices')}</Link></li>
              <li><Link href="/carbono/projetos" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('carbonData')}</Link></li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-300">{tNav('community')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/feed" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('newsFeed')}</Link></li>
              <li><Link href="/leaderboard" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('ranking')}</Link></li>
              <li><Link href="/conquistas" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('missionsAndAchievements')}</Link></li>
              <li><Link href="/contribuir" className="text-emerald-400 text-[13px] hover:text-emerald-300 transition-colors font-medium">{tNav('contribute')}</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-300">{tNav('institutional') || 'Institucional'}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/sobre" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('about') || 'Sobre'}</Link></li>
              <li><Link href="/contato" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('contact') || 'Contato'}</Link></li>
              <li><Link href="/privacidade" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('privacy') || 'Privacidade'}</Link></li>
              <li><Link href="/termos" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('terms') || 'Termos'}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 lg:pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6 text-slate-500 text-[13px]">
          <p>© {currentYear} Sintropia. {tFooter('rightsReserved')}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              Status: <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> {tFooter('stable')}
            </span>
            <span className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
              {tFooter('location')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
