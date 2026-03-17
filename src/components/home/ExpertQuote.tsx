'use client';

import { Quote } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  role: string;
  organization: string;
}

const quotes = {
  pt: {
    text: 'O mercado de créditos de carbono é uma ferramenta essencial para mobilizar financiamento privado para ação climática. Com transparência e integridade, pode acelerar significativamente nossa transição para uma economia de baixo carbono.',
    author: 'Rachel Kyte',
    role: 'Ex-Diretora Executiva',
    organization: 'Climate Policy Initiative'
  },
  en: {
    text: 'The carbon credit market is an essential tool to mobilize private finance for climate action. With transparency and integrity, it can significantly accelerate our transition to a low-carbon economy.',
    author: 'Rachel Kyte',
    role: 'Former Executive Director',
    organization: 'Climate Policy Initiative'
  },
  es: {
    text: 'El mercado de créditos de carbono es una herramienta esencial para movilizar financiamiento privado para la acción climática. Con transparencia e integridad, puede acelerar significativamente nuestra transición a una economía baja en carbono.',
    author: 'Rachel Kyte',
    role: 'Ex-Directora Ejecutiva',
    organization: 'Climate Policy Initiative'
  }
};

export function ExpertQuote({ locale }: { locale: string }) {
  const quote = quotes[locale as keyof typeof quotes] || quotes.en;

  return (
    <section className="bg-forest-green py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
        <Quote className="w-12 h-12 text-emerald-400 mx-auto mb-8 opacity-60" />
        <blockquote className="text-xl lg:text-2xl text-white font-light leading-relaxed mb-8">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <div className="text-white">
          <p className="font-bold text-lg">{quote.author}</p>
          <p className="text-emerald-300 text-sm">{quote.role}, {quote.organization}</p>
        </div>
      </div>
    </section>
  );
}
