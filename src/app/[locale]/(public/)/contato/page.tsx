import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';
import { Mail, MapPin, Linkedin, Github } from 'lucide-react';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    pt: 'Contato | Sintropia',
    en: 'Contact | Sintropia',
    es: 'Contacto | Sintropia'
  };
  
  const descriptions: Record<string, string> = {
    pt: 'Entre em contato com a equipe Sintropia para dúvidas, parcerias ou suporte',
    en: 'Get in touch with the Sintropia team for questions, partnerships, or support',
    es: 'Póngase en contacto con el equipo de Sintropia para consultas, asociaciones o soporte'
  };
  
  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const content = {
    pt: {
      hero: { title: 'Entre em Contato', subtitle: 'Estamos aqui para ajudar com suas dúvidas sobre mercados de carbono e energia renovável' },
      methods: {
        email: { title: 'E-mail', desc: 'Resposta em até 24 horas úteis', value: 'edmilson.rodrigues@futurereadylabs.com.br' },
        linkedin: { title: 'LinkedIn', desc: 'Conecte-se com a Future Ready Labs', value: 'Future Ready Labs' },
        github: { title: 'GitHub', desc: 'Contribua com o projeto open source', value: 'github.com/edrodrigues/sintropia-carbono' },
        location: { title: 'Localização', desc: 'Recife, Pernambuco - Brasil', value: 'Recife, Pernambuco - Brasil' }
      },
      response: { title: 'Tempo de Resposta', content: 'Nossa equipe se compromete a responder todas as mensagens em até 24 horas úteis. Para questões técnicas urgentes, recomendamos abrir uma issue no GitHub.', status: 'Respondendo em até 24h' },
      cta: { title: 'Pronto para começar?', subtitle: 'Junte-se a milhares de profissionais que utilizam a Sintropia para acompanhar o mercado de carbono', button: 'Criar conta gratuita' }
    },
    en: {
      hero: { title: 'Get in Touch', subtitle: 'We are here to help with your questions about carbon and renewable energy markets' },
      methods: {
        email: { title: 'Email', desc: 'Response within 24 business hours', value: 'edmilson.rodrigues@futurereadylabs.com.br' },
        linkedin: { title: 'LinkedIn', desc: 'Connect with Future Ready Labs', value: 'Future Ready Labs' },
        github: { title: 'GitHub', desc: 'Contribute to the open source project', value: 'github.com/edrodrigues/sintropia-carbono' },
        location: { title: 'Location', desc: 'Recife, Pernambuco - Brazil', value: 'Recife, Pernambuco - Brazil' }
      },
      response: { title: 'Response Time', content: 'Our team is committed to responding to all messages within 24 business hours. For urgent technical issues, we recommend opening an issue on GitHub.', status: 'Responding within 24h' },
      cta: { title: 'Ready to get started?', subtitle: 'Join thousands of professionals using Sintropia to track the carbon market', button: 'Create free account' }
    },
    es: {
      hero: { title: 'Póngase en Contacto', subtitle: 'Estamos aquí para ayudar con sus preguntas sobre mercados de carbono y energía renovable' },
      methods: {
        email: { title: 'Correo Electrónico', desc: 'Respuesta en hasta 24 horas hábiles', value: 'edmilson.rodrigues@futurereadylabs.com.br' },
        linkedin: { title: 'LinkedIn', desc: 'Conecte con Future Ready Labs', value: 'Future Ready Labs' },
        github: { title: 'GitHub', desc: 'Contribuya al proyecto open source', value: 'github.com/edrodrigues/sintropia-carbono' },
        location: { title: 'Ubicación', desc: 'Recife, Pernambuco - Brasil', value: 'Recife, Pernambuco - Brasil' }
      },
      response: { title: 'Tiempo de Respuesta', content: 'Nuestro equipo se compromete a responder todos los mensajes en hasta 24 horas hábiles. Para problemas técnicos urgentes, recomendamos abrir una issue en GitHub.', status: 'Respondiendo en 24h' },
      cta: { title: '¿Listo para comenzar?', subtitle: 'Únase a miles de profesionales que utilizan Sintropia para seguir el mercado de carbono', button: 'Crear cuenta gratuita' }
    }
  };

  const t = content[locale as keyof typeof content] || content.pt;

  const contactMethods = [
    {
      icon: Mail,
      title: t.methods.email.title,
      value: t.methods.email.value,
      href: 'mailto:edmilson.rodrigues@futurereadylabs.com.br',
      description: t.methods.email.desc
    },
    {
      icon: Linkedin,
      title: t.methods.linkedin.title,
      value: t.methods.linkedin.value,
      href: 'https://www.linkedin.com/company/future-ready-labs-br',
      description: t.methods.linkedin.desc,
      external: true
    },
    {
      icon: Github,
      title: t.methods.github.title,
      value: t.methods.github.value,
      href: 'https://github.com/edrodrigues/sintropia-carbono',
      description: t.methods.github.desc,
      external: true
    },
    {
      icon: MapPin,
      title: t.methods.location.title,
      value: t.methods.location.value,
      href: '#',
      description: t.methods.location.desc
    }
  ];

  return (
    <>
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

        {/* Contact Methods */}
        <section className="max-w-6xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noopener noreferrer' : undefined}
                className="group bg-white rounded-2xl p-8 shadow-premium border border-slate-100 hover:border-emerald-200 hover:shadow-premium-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <method.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-green mb-1">{method.title}</h3>
                    <p className="text-emerald-600 font-medium mb-2">{method.value}</p>
                    <p className="text-sm text-slate-500">{method.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Response Time */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-6">
              {t.response.title}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {t.response.content}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">{t.response.status}</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-6">
            {t.cta.title}
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-forest-green text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-900 transition-all"
          >
            {t.cta.button}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
