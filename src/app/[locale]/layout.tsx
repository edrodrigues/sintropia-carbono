import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { StrictModeFix } from "@/components/layout/StrictModeFix";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Sintropia: A rede profissional para mercados ambientais e sustentabilidade",
    en: "Sintropia: The Professional Network for Environmental Markets & Sustainability",
    es: "Sintropia: La red profesional para mercados ambientales y sostenibilidad",
  };

  const descriptions: Record<string, string> = {
    pt: "Conecte-se com profissionais de carbono, energia renovável, ESG e sustentabilidade. Dados de mercado, insights e networking profissional — tudo em um só lugar.",
    en: "Connect with professionals in carbon markets, renewable energy, ESG, and sustainability. Market data, insights, and professional networking — all in one place.",
    es: "Conéctate con profesionales de carbono, energía renovable, ASG y sostenibilidad. Datos de mercado, perspectivas y networking profesional — todo en un solo lugar.",
  };

  const currentTitle = titles[locale] || titles.pt;
  const currentDescription = descriptions[locale] || descriptions.pt;
  const siteUrl = "https://sintropia.space";

  return {
    title: currentTitle,
    description: currentDescription,
    keywords: locale === "pt"
      ? ["carbono", "créditos de carbono", "energia renovável", "I-REC", "certificados de energia", "mercado de carbono", "ESG", "sustentabilidade", "rede profissional", "mercados ambientais"]
      : ["carbon", "carbon credits", "renewable energy", "I-REC", "energy certificates", "carbon market", "ESG", "sustainability", "professional network", "environmental markets"],
    authors: [{ name: "Comunidade Sintropia" }],
    creator: "Comunidade Sintropia",
    publisher: "Sintropia",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
      languages: {
        "pt-BR": siteUrl,
        "en-US": `${siteUrl}/en`,
        "es-ES": `${siteUrl}/es`,
      },
    },
    openGraph: {
      title: currentTitle,
      description: currentDescription,
      url: siteUrl,
      siteName: "Sintropia",
      locale: locale === "pt" ? "pt_BR" : locale === "en" ? "en_US" : "es_ES",
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Sintropia — The network for professionals shaping environmental markets.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: currentTitle,
      description: currentDescription,
      site: "@sintropyspace",
      creator: "@sintropyspace",
      images: [`${siteUrl}/images/og-image.png`],
    },
    other: {
      "talentapp:project_verification": "f100710936df5570a88ceb25e02b14efc229cb21e050252347870eeaccaa0abfa02864bd87d792570b51f49d1d79d5c72fd3b08bf88164ac379c9cbc9a0de066",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        "index": true,
        "follow": true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale as (typeof routing.locales)[number]} className={`${GeistSans.className} ${inter.variable} light antialiased dark:bg-gray-950`}>
      <body className="antialiased font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <StrictModeFix />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-forest-green focus:text-white focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Pular para o conteúdo principal
          </a>
          {children}

          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-BC4PP7XDM6"
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BC4PP7XDM6');
          `}
          </Script>
          <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "inLanguage": locale,
                "name": "Sintropia",
                "url": "https://sintropia.space",
                "description": "A rede profissional para mercados ambientais e sustentabilidade. Dados abertos, comunidade colaborativa.",
                "sameAs": [
                  "https://github.com/edrodrigues/sintropia-carbono",
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "community",
                  "url": `https://sintropia.space/${locale}/feed`,
                },
                "logo": "https://sintropia.space/favicon.svg",
              }),
            }}
          />
          <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "inLanguage": locale,
                "name": "Sintropia",
                "url": "https://sintropia.space",
                "description": "A rede profissional para mercados ambientais e sustentabilidade.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `https://sintropia.space/${locale}/feed?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
