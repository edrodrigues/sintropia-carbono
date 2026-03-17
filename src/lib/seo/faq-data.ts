export interface FAQItem {
  question: string;
  answer: string;
}

export interface LocalizedFAQData {
  [locale: string]: FAQItem[];
}

export const homeFAQs: LocalizedFAQData = {
  pt: [
    {
      question: 'O que é um crédito de carbono?',
      answer: 'Um crédito de carbono representa uma tonelada de dióxido de carbono (CO2) ou equivalente em gases de efeito estufa que foi removida da atmosfera ou evitada de ser emitida. As empresas podem comprar esses créditos para compensar suas emissões enquanto trabalham na transição para operações de baixo carbono. Cada crédito é verificado e certificado por organizações reconhecidas internacionalmente como Verra e Gold Standard, garantindo sua legitimidade e impacto real.'
    },
    {
      question: 'Como é calculado o Índice S-REC?',
      answer: 'O Índice S-REC é calculado através da agregação ponderada de preços de certificados de energia renovável (I-RECs) de múltiplas fontes e regiões geográficas. Nossa metodologia analisa dados de mercado em tempo real, considerando fatores como tipo de fonte renovável (solar, eólica, hidrelétrica), localização geográfica, idade do projeto e volume de transações. O índice fornece uma referência de preço consolidada que reflete as tendências reais do mercado de energia renovável global.'
    },
    {
      question: 'Quais certificadoras de carbono são monitoradas?',
      answer: 'Monitoramos as principais certificadoras de carbono globalmente reconhecidas, incluindo Verra (Verified Carbon Standard - VCS), Gold Standard, Climate Action Reserve (CAR), American Carbon Registry (ACR), e Plan Vivo. Também acompanhamos certificadoras regionais e emergentes como SOCIALCARBON e GCC (Global Carbon Council). Nossa plataforma integra dados de todos esses padrões para fornecer uma visão abrangente do mercado de créditos de carbono voluntário.'
    },
    {
      question: 'Os dados são atualizados com qual frequência?',
      answer: 'Nossa plataforma atualiza os preços de mercado e dados de transações diariamente através de integrações diretas com bolsas de carbono e registradoras de créditos. O Índice S-REC é recalculado semanalmente para incorporar novos dados de negociação de I-RECs. Relatórios mensais fornecem análises aprofundadas de tendências de mercado, volume de transações e desenvolvimentos regulatórios. Usuários premium têm acesso a atualizações em tempo real e alertas de preço personalizados.'
    }
  ],
  en: [
    {
      question: 'What is a carbon credit?',
      answer: 'A carbon credit represents one tonne of carbon dioxide (CO2) or equivalent greenhouse gas that has been removed from the atmosphere or prevented from being emitted. Companies can purchase these credits to offset their emissions while working toward transitioning to low-carbon operations. Each credit is verified and certified by internationally recognized organizations such as Verra and Gold Standard, ensuring its legitimacy and real environmental impact.'
    },
    {
      question: 'How is the S-REC Index calculated?',
      answer: 'The S-REC Index is calculated through the weighted aggregation of renewable energy certificate (I-REC) prices from multiple sources and geographic regions. Our methodology analyzes real-time market data, considering factors such as renewable source type (solar, wind, hydroelectric), geographic location, project age, and transaction volume. The index provides a consolidated price benchmark that reflects actual global renewable energy market trends.'
    },
    {
      question: 'Which carbon certifiers are monitored?',
      answer: 'We monitor the major globally recognized carbon certifiers, including Verra (Verified Carbon Standard - VCS), Gold Standard, Climate Action Reserve (CAR), American Carbon Registry (ACR), and Plan Vivo. We also track regional and emerging certifiers such as SOCIALCARBON and GCC (Global Carbon Council). Our platform integrates data from all these standards to provide a comprehensive view of the voluntary carbon credit market.'
    },
    {
      question: 'How frequently is the data updated?',
      answer: 'Our platform updates market prices and transaction data daily through direct integrations with carbon exchanges and credit registries. The S-REC Index is recalculated weekly to incorporate new I-REC trading data. Monthly reports provide in-depth analysis of market trends, transaction volumes, and regulatory developments. Premium users have access to real-time updates and customized price alerts.'
    }
  ],
  es: [
    {
      question: '¿Qué es un crédito de carbono?',
      answer: 'Un crédito de carbono representa una tonelada de dióxido de carbono (CO2) o equivalente en gases de efecto invernadero que ha sido removida de la atmósfera o evitada de ser emitida. Las empresas pueden comprar estos créditos para compensar sus emisiones mientras trabajan en la transición hacia operaciones de bajo carbono. Cada crédito es verificado y certificado por organizaciones reconocidas internacionalmente como Verra y Gold Standard, garantizando su legitimidad e impacto real.'
    },
    {
      question: '¿Cómo se calcula el Índice S-REC?',
      answer: 'El Índice S-REC se calcula a través de la agregación ponderada de precios de certificados de energía renovable (I-RECs) de múltiples fuentes y regiones geográficas. Nuestra metodología analiza datos de mercado en tiempo real, considerando factores como el tipo de fuente renovable (solar, eólica, hidroeléctrica), ubicación geográfica, edad del proyecto y volumen de transacciones. El índice proporciona un punto de referencia de precio consolidado que refleja las tendencias reales del mercado global de energía renovable.'
    },
    {
      question: '¿Qué certificadoras de carbono son monitoreadas?',
      answer: 'Monitoreamos las principales certificadoras de carbono reconocidas globalmente, incluyendo Verra (Verified Carbon Standard - VCS), Gold Standard, Climate Action Reserve (CAR), American Carbon Registry (ACR) y Plan Vivo. También seguimos certificadoras regionales y emergentes como SOCIALCARBON y GCC (Global Carbon Council). Nuestra plataforma integra datos de todos estos estándares para proporcionar una visión completa del mercado voluntario de créditos de carbono.'
    },
    {
      question: '¿Con qué frecuencia se actualizan los datos?',
      answer: 'Nuestra plataforma actualiza los precios de mercado y datos de transacciones diariamente a través de integraciones directas con bolsas de carbono y registros de créditos. El Índice S-REC se recalcula semanalmente para incorporar nuevos datos de comercio de I-RECs. Los informes mensuales proporcionan análisis profundos de tendencias de mercado, volúmenes de transacciones y desarrollos regulatorios. Los usuarios premium tienen acceso a actualizaciones en tiempo real y alertas de precios personalizadas.'
    }
  ]
};

export function getFAQsByLocale(locale: string, faqData: LocalizedFAQData = homeFAQs): FAQItem[] {
  return faqData[locale] || faqData['en'] || [];
}
