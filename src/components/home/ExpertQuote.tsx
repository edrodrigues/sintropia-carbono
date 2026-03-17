'use client';

import { Quote } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  role: string;
  organization: string;
}

const quotes: Record<string, QuoteData> = {
  pt: {
    text: 'O mercado de créditos de carbono é uma ferramenta essencial para mobilizar financiamento privado para a ação climática. Com transparência e integridade, pode acelerar significativamente nossa transição para uma economia de baixo carbono.',
    author: 'Rachel Kyte',
    role: 'Ex-Diretora Executiva',
    organization: 'Climate Policy Initiative',
  },
  en: {
    text: 'The carbon credit market is an essential tool to mobilize private finance for climate action. With transparency and integrity, it can significantly accelerate our transition to a low-carbon economy.',
    author: 'Rachel Kyte',
    role: 'Former Executive Director',
    organization: 'Climate Policy Initiative',
  },
  es: {
    text: 'El mercado de créditos de carbono es una herramienta esencial para movilizar financiamiento privado para la acción climática. Con transparencia e integridad, puede acelerar significativamente nuestra transición hacia una economía baja en carbono.',
    author: 'Rachel Kyte',
    role: 'Ex-Directora Ejecutiva',
    organization: 'Climate Policy Initiative',
  },
};

export function ExpertQuote({ locale }: { locale: string }) {
  const quote = quotes[locale] ?? quotes.en;

  return (
    <section className="bg-forest-green py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Quote Icon */}
          <Quote
            className="w-16 h-16 text-emerald-400/30 mb-8"
            aria-hidden="true"
          />

          {/* Quote Text */}
          <blockquote className="mb-10">
            <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
          </blockquote>

          {/* Author Info */}
          <div className="flex flex-col items-center">
            <cite className="not-italic">
              <span className="block text-lg font-semibold text-white">
                {quote.author}
              </span>
              <span className="block text-emerald-300 mt-1">
                {quote.role}, {quote.organization}
              </span>
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}
