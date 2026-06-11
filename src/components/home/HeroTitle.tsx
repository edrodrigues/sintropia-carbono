"use client";

interface HeroTitleProps {
  title: string;
  locale: string;
}

export function HeroTitle({ title, locale }: HeroTitleProps) {
  return (
    <span dangerouslySetInnerHTML={{
      __html: locale === "pt"
        ? title
          .replace("mercados ambientais", "<span class=\"text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8\">mercados ambientais</span>")
          .replace("sustentabilidade", "<span class=\"text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8\">sustentabilidade</span>")
        : title
          .replace("environmental markets", "<span class=\"text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8\">environmental markets</span>")
          .replace("sustainability", "<span class=\"text-emerald-500 underline decoration-emerald-200 underline-offset-4 lg:underline-offset-8\">sustainability</span>"),
    }}
    />
  );
}
