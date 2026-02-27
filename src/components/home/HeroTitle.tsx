"use client";

interface HeroTitleProps {
  title: string;
  locale: string;
}

export function HeroTitle({ title, locale }: HeroTitleProps) {
  return (
    <span dangerouslySetInnerHTML={{
      __html: locale === 'pt'
        ? title
            .replace('créditos de carbono', '<span class="text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8">créditos de carbono</span>')
            .replace('energia renovável', '<span class="text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8">energia renovável</span>')
        : title
            .replace('carbon credit', '<span class="text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8">carbon credit</span>')
            .replace('renewable energy', '<span class="text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8">renewable energy</span>')
    }} />
  );
}
