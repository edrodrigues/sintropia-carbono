import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';
import { FAQSchema } from '@/components/seo/FAQSchema';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    pt: 'Sobre | Sintropia',
    en: 'About | Sintropia',
    es: 'Sobre Nosotros | Sintropia'
  };
  
  const descriptions: Record<string, string> = {
    pt: 'Conheça a Sintropia - Plataforma de inteligência colaborativa sobre mercado de carbono e energia renovável',
    en: 'Learn about Sintropia - Collaborative intelligence platform for carbon credits and renewable energy markets',
    es: 'Conozca Sintropia - Plataforma de inteligencia colaborativa sobre mercado de carbono y energía renovable'
  };
  
  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
  };
}

const aboutFAQs = {
  pt: [
    {
      question: 'O que é a Sintropia?',
      answer: 'A Sintropia é uma plataforma de inteligência colaborativa que democratiza o acesso a dados sobre o mercado de créditos de carbono e energia renovável. Fundada em 2024, nossa missão é criar transparência e acessibilidade em mercados complexos através de tecnologia open source.'
    },
    {
      question: 'Como a Sintropia obtém seus dados?',
      answer: 'Coletamos dados de múltiplas fontes autoritativas incluindo registros oficiais de certificadoras (Verra, Gold Standard), bases governamentais brasileiras (SFB, ANA), relatórios internacionais (Banco Mundial, IEA) e contribuições da nossa comunidade de especialistas.'
    },
    {
      question: 'A plataforma é gratuita?',
      answer: 'Sim, o acesso básico aos dados e visualizações é completamente gratuito. Acreditamos que informação de qualidade sobre mercados ambientais deve ser acessível a todos. Oferecemos também planos premium para empresas que necessitam de análises avançadas e APIs dedicadas.'
    }
  ],
  en: [
    {
      question: 'What is Sintropia?',
      answer: 'Sintropia is a collaborative intelligence platform that democratizes access to data on the carbon credit and renewable energy markets. Founded in 2024, our mission is to create transparency and accessibility in complex markets through open source technology.'
    },
    {
      question: 'How does Sintropia obtain its data?',
      answer: 'We collect data from multiple authoritative sources including official certifier registries (Verra, Gold Standard), Brazilian government databases (SFB, ANA), international reports (World Bank, IEA), and contributions from our community of experts.'
    },
    {
      question: 'Is the platform free?',
      answer: 'Yes, basic access to data and visualizations is completely free. We believe quality information about environmental markets should be accessible to everyone. We also offer premium plans for companies needing advanced analytics and dedicated APIs.'
    }
  ],
  es: [
    {
      question: '¿Qué es Sintropia?',
      answer: 'Sintropia es una plataforma de inteligencia colaborativa que democratiza el acceso a datos sobre el mercado de créditos de carbono y energía renovable. Fundada en 2024, nuestra misión es crear transparencia y accesibilidad en mercados complejos a través de tecnología open source.'
    },
    {
      question: '¿Cómo obtiene Sintropia sus datos?',
      answer: 'Recolectamos datos de múltiples fuentes autoritativas incluyendo registros oficiales de certificadoras (Verra, Gold Standard), bases de datos gubernamentales brasileñas (SFB, ANA), reportes internacionales (Banco Mundial, IEA) y contribuciones de nuestra comunidad de expertos.'
    },
    {
      question: '¿La plataforma es gratuita?',
      answer: 'Sí, el acceso básico a datos y visualizaciones es completamente gratuito. Creemos que la información de calidad sobre mercados ambientales debe ser accesible para todos. También ofrecemos planes premium para empresas que necesitan análisis avanzados y APIs dedicadas.'
    }
  ]
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const content = {
    pt: {
      hero: { title: 'Sobre a Sintropia', subtitle: 'Democratizando o acesso a dados sobre mercados ambientais através de tecnologia open source' },
      mission: { 
        title: 'Nossa Missão', 
        content1: 'A Sintropia nasceu da convicção de que dados de qualidade sobre mercados de carbono e energia renovável devem ser acessíveis a todos - desde grandes corporações até pequenos produtores rurais.',
        content2: 'Combinamos dados de fontes autoritativas globais com inteligência colaborativa para criar a visão mais completa e atualizada dos mercados ambientais brasileiro e global.'
      },
      values: { 
        title: 'Nossos Valores',
        transparency: { title: 'Transparência', desc: 'Todos os dados são abertos e rastreáveis até suas fontes originais' },
        collaboration: { title: 'Colaboração', desc: 'Acreditamos no poder da comunidade para validar e enriquecer informações' },
        openness: { title: 'Open Source', desc: 'Nosso código é aberto, permitindo auditoria e contribuições da comunidade' }
      },
      team: { title: 'Nossa Equipe', founder: 'Fundador & CEO', founderBio: 'Especialista em mercados ambientais e desenvolvedor full-stack, Edmilson fundou a Sintropia com a missão de democratizar o acesso a dados de carbono.' },
      faq: { title: 'Perguntas Frequentes' }
    },
    en: {
      hero: { title: 'About Sintropia', subtitle: 'Democratizing access to environmental market data through open source technology' },
      mission: { 
        title: 'Our Mission', 
        content1: 'Sintropia was born from the conviction that quality data on carbon and renewable energy markets should be accessible to everyone - from large corporations to small rural producers.',
        content2: 'We combine data from authoritative global sources with collaborative intelligence to create the most complete and up-to-date view of Brazilian and global environmental markets.'
      },
      values: { 
        title: 'Our Values',
        transparency: { title: 'Transparency', desc: 'All data is open and traceable to its original sources' },
        collaboration: { title: 'Collaboration', desc: 'We believe in the power of community to validate and enrich information' },
        openness: { title: 'Open Source', desc: 'Our code is open, allowing audit and community contributions' }
      },
      team: { title: 'Our Team', founder: 'Founder & CEO', founderBio: 'Environmental markets specialist and full-stack developer, Edmilson founded Sintropia with the mission to democratize access to carbon data.' },
      faq: { title: 'Frequently Asked Questions' }
    },
    es: {
      hero: { title: 'Sobre Sintropia', subtitle: 'Democratizando el acceso a datos de mercados ambientales a través de tecnología open source' },
      mission: { 
        title: 'Nuestra Misión', 
        content1: 'Sintropia nació de la convicción de que los datos de calidad sobre mercados de carbono y energía renovable deben ser accesibles para todos - desde grandes corporaciones hasta pequeños productores rurales.',
        content2: 'Combinamos datos de fuentes autoritativas globales con inteligencia colaborativa para crear la visión más completa y actualizada de los mercados ambientales brasileños y globales.'
      },
      values: { 
        title: 'Nuestros Valores',
        transparency: { title: 'Transparencia', desc: 'Todos los datos son abiertos y rastreables hasta sus fuentes originales' },
        collaboration: { title: 'Colaboración', desc: 'Creemos en el poder de la comunidad para validar y enriquecer la información' },
        openness: { title: 'Open Source', desc: 'Nuestro código es abierto, permitiendo auditoría y contribuciones de la comunidad' }
      },
      team: { title: 'Nuestro Equipo', founder: 'Fundador y CEO', founderBio: 'Especialista en mercados ambientales y desarrollador full-stack, Edmilson fundó Sintropia con la misión de democratizar el acceso a datos de carbono.' },
      faq: { title: 'Preguntas Frecuentes' }
    }
  };

  const t = content[locale as keyof typeof content] || content.pt;
  const faqs = aboutFAQs[locale as keyof typeof aboutFAQs] || aboutFAQs.pt;

  return (
    <>
      <FAQSchema items={faqs} pageName="about" />
      <Header />
      <main id="main-content" className="w-full" tabIndex={-1}>
        {/* Hero */}
        <section className="bg-forest-green py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              {t.hero.title}
            </h1>
            <p className="text-lg lg:text-xl text-emerald-100 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-6">
            {t.mission.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            {t.mission.content1}
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t.mission.content2}
          </p>
        </section>

        {/* Values */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-12 text-center">
              {t.values.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: t.values.transparency.title, desc: t.values.transparency.desc, icon: '🔍' },
                { title: t.values.collaboration.title, desc: t.values.collaboration.desc, icon: '🤝' },
                { title: t.values.openness.title, desc: t.values.openness.desc, icon: '🔓' }
              ].map((value, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-premium border border-slate-100 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-forest-green mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-12 text-center">
            {t.team.title}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
              👨‍💻
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-forest-green">Edmilson Rodrigues</h3>
              <p className="text-emerald-600 font-medium mb-2">{t.team.founder}</p>
              <p className="text-slate-600 max-w-md">{t.team.founderBio}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-12 text-center">
              {t.faq.title}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white rounded-xl p-6 shadow-premium border border-slate-100 group">
                  <summary className="font-bold text-forest-green cursor-pointer flex items-center justify-between">
                    {faq.question}
                    <span className="text-emerald-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
