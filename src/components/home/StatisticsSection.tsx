import { getTranslations } from 'next-intl/server';

interface StatItem {
  value: string;
  label: string;
  source: string;
  trend?: string;
}

async function getMarketStats(locale: string): Promise<StatItem[]> {
  const stats = {
    pt: [
      {
        value: '5.2 Gt',
        label: 'Volume global de créditos de carbono em 2025',
        source: 'Banco Mundial',
        trend: '+12% YoY'
      },
      {
        value: 'US$ 2.8B',
        label: 'Valor do mercado voluntário de carbono',
        source: 'Ecosystem Marketplace',
        trend: '+18% YoY'
      },
      {
        value: '850+',
        label: 'Projetos certificados no Brasil',
        source: 'Sistema de Registro Florestal',
        trend: '+23% YoY'
      },
      {
        value: '42%',
        label: 'Redução de emissões projetada até 2030',
        source: 'IEA - Agência Internacional de Energia',
        trend: 'Meta Brasil'
      }
    ],
    en: [
      {
        value: '5.2 Gt',
        label: 'Global carbon credit volume in 2025',
        source: 'World Bank',
        trend: '+12% YoY'
      },
      {
        value: 'US$ 2.8B',
        label: 'Voluntary carbon market value',
        source: 'Ecosystem Marketplace',
        trend: '+18% YoY'
      },
      {
        value: '850+',
        label: 'Certified projects in Brazil',
        source: 'Forest Registry System',
        trend: '+23% YoY'
      },
      {
        value: '42%',
        label: 'Projected emissions reduction by 2030',
        source: 'IEA - International Energy Agency',
        trend: 'Brazil Target'
      }
    ],
    es: [
      {
        value: '5.2 Gt',
        label: 'Volumen global de créditos de carbono en 2025',
        source: 'Banco Mundial',
        trend: '+12% YoY'
      },
      {
        value: 'US$ 2.8B',
        label: 'Valor del mercado voluntario de carbono',
        source: 'Ecosystem Marketplace',
        trend: '+18% YoY'
      },
      {
        value: '850+',
        label: 'Proyectos certificados en Brasil',
        source: 'Sistema de Registro Forestal',
        trend: '+23% YoY'
      },
      {
        value: '42%',
        label: 'Reducción de emisiones proyectada para 2030',
        source: 'IEA - Agencia Internacional de Energía',
        trend: 'Meta Brasil'
      }
    ]
  };
  
  return stats[locale as keyof typeof stats] || stats.pt;
}

export async function StatisticsSection({ locale }: { locale: string }) {
  const stats = await getMarketStats(locale);

  const titles = {
    pt: { title: 'Dados do Mercado de Carbono', subtitle: 'Estatísticas atualizadas baseadas em dados de fontes autoritativas globais', disclaimer: '* Dados de 2024-2025. Fontes: World Bank, Ecosystem Marketplace, IEA, SFB' },
    en: { title: 'Carbon Market Data', subtitle: 'Updated statistics based on data from authoritative global sources', disclaimer: '* Data from 2024-2025. Sources: World Bank, Ecosystem Marketplace, IEA, SFB' },
    es: { title: 'Datos del Mercado de Carbono', subtitle: 'Estadísticas actualizadas basadas en datos de fuentes autoritativas globales', disclaimer: '* Datos de 2024-2025. Fuentes: World Bank, Ecosystem Marketplace, IEA, SFB' }
  };

  const t = titles[locale as keyof typeof titles] || titles.pt;

  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-forest-green mb-4">
            {t.title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-premium border border-slate-100">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-forest-green">{stat.value}</span>
                {stat.trend && (
                  <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 font-medium mb-3">{stat.label}</p>
              <p className="text-xs text-slate-400">Fonte: {stat.source}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">{t.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
