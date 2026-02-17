import type { Metadata } from "next";
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
  title: "Sintropia Carbono: Inteligência sobre o mercado de créditos de carbono e Energia",
  description:
    "Dashboard de inteligência colaborativa sobre certificadoras, volumes, preços e tendências do mercado de créditos de carbono e certificados de energia no Brasil e no mundo.",
  openGraph: {
    title: "Sintropia Carbono",
    description: "Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e energia.",
    url: "https://sintropiacarbono.com.br",
    siteName: "Sintropia Carbono",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sintropia Carbono",
    description: "Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e energia.",
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
    <html lang="pt-BR" className={`${inter.variable} light`}>
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
      </body>
    </html>
  );
}
