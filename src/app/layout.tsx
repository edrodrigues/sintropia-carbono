import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { StrictModeFix } from "@/components/layout/StrictModeFix";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sintropia: Inteligência sobre o mercado de créditos de carbono e Energia",
  description:
    "Dashboard de inteligência colaborativa sobre certificadoras, volumes, preços e tendências do mercado de créditos de carbono e certificados de energia no Brasil e no mundo.",
  keywords: ["carbono", "créditos de carbono", "energia renovável", "I-REC", "certificados de energia", "mercado de carbono", "Brasil", "mundo"],
  authors: [{ name: "Comunidade Sintropia" }],
  creator: "Comunidade Sintropia",
  publisher: "Sintropia",
  metadataBase: new URL("https://sintropia.space"),
  alternates: {
    canonical: "https://sintropia.space",
    languages: {
      "pt-BR": "https://sintropia.space",
    },
  },
  openGraph: {
    title: "Sintropia: Inteligência sobre o mercado de carbono e energia",
    description: "Dashboard de inteligência colaborativa sobre certificadoras, volumes, preços e tendências do mercado de créditos de carbono e certificados de energia no Brasil e no mundo.",
    url: "https://sintropia.space",
    siteName: "Sintropia",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sintropia: Inteligência sobre o mercado de carbono e energia",
    description: "Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e energia.",
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.className} ${inter.variable} light antialiased dark:bg-gray-950`}>
      <body className="antialiased font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <StrictModeFix />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BC4PP7XDM6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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
      </body>
    </html>
  );
}
