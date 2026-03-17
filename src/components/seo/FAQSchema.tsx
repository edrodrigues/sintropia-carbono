'use client';

import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
  pageName: string;
}

export function FAQSchema({ items, pageName }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://sintropia.space/#faq-${pageName}`,
    mainEntity: items.map((item, index) => ({
      '@type': 'Question',
      '@id': `https://sintropia.space/#faq-${pageName}-q${index + 1}`,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        '@id': `https://sintropia.space/#faq-${pageName}-a${index + 1}`,
        text: item.answer
      }
    }))
  };

  return (
    <Script
      id={`faq-schema-${pageName}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
