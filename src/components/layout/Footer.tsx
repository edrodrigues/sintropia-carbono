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
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.48.75 2.78 1.89 3.55-.7-.02-1.35-.21-1.93-.53v.05c0 2.07 1.47 3.79 3.42 4.19-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.54 1.69 2.11 2.92 3.98 2.95-1.46 1.15-3.3 1.84-5.3 1.84-.34 0-.68-.02-1.01-.06 1.88 1.21 4.12 1.92 6.54 1.92 7.84 0 12.13-6.5 12.13-12.13 0-.18 0-.37-.01-.55.83-.6 1.56-1.36 2.14-2.22z" /></svg>
              </a>
              {/* Twitter / X */}
              <a href="https://x.com/sintropyspace" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all group">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.337 3.608 1.312.975.975 1.25 2.242 1.312 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.337 2.633-1.312 3.608-.975.975-2.242 1.25-3.608 1.312-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.337-3.608-1.312-.975-.975-1.25-2.242-1.312-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.337-2.633 1.312-3.608.975-.975 2.242-1.25 3.608-1.312 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.62 6.759 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.337-.2 6.759-2.62 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all group">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
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

          {/* Comunidade & Empresa */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-300">{tNav('community')}</h4>
            <ul className="flex flex-col gap-4 mb-8">
              <li><Link href="/feed" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('newsFeed')}</Link></li>
              <li><Link href="/leaderboard" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('ranking')}</Link></li>
              <li><Link href="/conquistas" className="text-slate-400 text-[13px] hover:text-emerald-400 transition-colors">{tNav('missionsAndAchievements')}</Link></li>
              <li><Link href="/contribuir" className="text-emerald-400 text-[13px] hover:text-emerald-300 transition-colors font-medium">{tNav('contribute')}</Link></li>
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
