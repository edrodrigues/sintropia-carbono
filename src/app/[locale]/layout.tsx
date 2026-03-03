import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { StrictModeFix } from "@/components/layout/StrictModeFix";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    pt: "Sintropia: Inteligência sobre o mercado de créditos de carbono e Energia",
    en: "Sintropia: Intelligence on carbon credits and energy market",
    es: "Sintropia: Inteligencia sobre el mercado de créditos de carbono y energía"
  };
  
  const descriptions: Record<string, string> = {
    pt: "Dashboard de inteligência colaborativa sobre certificadoras, volumes, preços e tendências do mercado de créditos de carbono e certificados de energia no mundo.",
    en: "Collaborative intelligence dashboard on certifiers, volumes, prices, and trends in the carbon credits and energy certificates market worldwide.",
    es: "Panel de inteligencia colaborativa sobre certificadoras, volúmenes, precios y tendencias del mercado de créditos de carbono y certificados de energía en el mundo."
  };

  const currentTitle = titles[locale] || titles.pt;
  const currentDescription = descriptions[locale] || descriptions.pt;
  const siteUrl = "https://sintropia.space";

  return {
    title: currentTitle,
    description: currentDescription,
    keywords: locale === "pt" 
      ? ["carbono", "créditos de carbono", "energia renovável", "I-REC", "certificados de energia", "mercado de carbono", "mundo"]
      : ["carbon", "carbon credits", "renewable energy", "I-REC", "energy certificates", "carbon market", "world"],
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
          url: "https://i.ibb.co/bjL1KkKF/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Sintropia - Inteligência sobre mercado de carbono e energia renovável"
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: currentTitle,
      description: currentDescription,
      site: "@sintropyspace",
      creator: "@sintropyspace",
      images: ["https://i.ibb.co/bjL1KkKF/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
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
  params
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
                "name": "Sintropia",
                "url": "https://sintropia.space",
                "description": "Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e energia renovável.",
                "sameAs": [
                  "https://github.com/edrodrigues/sintropia-carbono"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "community",
                  "url": "https://sintropia.space/feed"
                },
                "logo": "https://sintropia.space/favicon.svg"
              })
            }}
          />
          <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Sintropia",
                "url": "https://sintropia.space",
                "description": "Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e energia renovável.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://sintropia.space/feed?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
