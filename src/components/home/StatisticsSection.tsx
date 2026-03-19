import { getTranslations } from 'next-intl/server';

interface StatItem {
  value: string;
  label: string;
  source: string;
  trend?: string;
}

export async function StatisticsSection({ locale }: { locale: string }) {
  const tStats = await getTranslations('stats');

  // Locale-aware statistics data
  const getStats = (): StatItem[] => {
    if (locale === 'pt') {
      return [
        {
          value: '5.2 Gt',
          label: 'Volume global de créditos de carbono em 2025',
          source: 'Banco Mundial',
          trend: '+12% YoY',
        },
        {
          value: 'US$ 2.8B',
          label: 'Valor do mercado voluntário de carbono',
          source: 'Ecosystem Marketplace',
          trend: '+18% YoY',
        },
        {
          value: '850+',
          label: 'Projetos certificados no Brasil',
          source: 'SFB (Sistema de Registro Florestal)',
          trend: '+23% YoY',
        },
        {
          value: '42%',
          label: 'Redução de emissões projetada até 2030',
          source: 'IEA (Agência Internacional de Energia)',
          trend: 'Meta Brasil',
        },
      ];
    } else if (locale === 'es') {
      return [
        {
          value: '5.2 Gt',
          label: 'Volumen global de créditos de carbono en 2025',
          source: 'Banco Mundial',
          trend: '+12% YoY',
        },
        {
          value: 'US$ 2.8B',
          label: 'Valor del mercado voluntario de carbono',
          source: 'Ecosystem Marketplace',
          trend: '+18% YoY',
        },
        {
          value: '850+',
          label: 'Proyectos certificados en Brasil',
          source: 'SFB (Sistema de Registro Florestal)',
          trend: '+23% YoY',
        },
        {
          value: '42%',
          label: 'Reducción de emisiones proyectada para 2030',
          source: 'IEA (Agencia Internacional de Energía)',
          trend: 'Meta Brasil',
        },
      ];
    } else {
      // English (default)
      return [
        {
          value: '5.2 Gt',
          label: 'Global carbon credit volume in 2025',
          source: 'World Bank',
          trend: '+12% YoY',
        },
        {
          value: 'US$ 2.8B',
          label: 'Voluntary carbon market value',
          source: 'Ecosystem Marketplace',
          trend: '+18% YoY',
        },
        {
          value: '850+',
          label: 'Certified projects in Brazil',
          source: 'SFB (Forest Registry System)',
          trend: '+23% YoY',
        },
        {
          value: '42%',
          label: 'Projected emissions reduction by 2030',
          source: 'IEA (International Energy Agency)',
          trend: 'Brazil Target',
        },
      ];
    }
  };

  const stats = getStats();

  // Locale-aware heading and subtitle
  const getHeading = () => {
    if (locale === 'pt') return 'Dados do Mercado de Carbono';
    if (locale === 'es') return 'Datos del Mercado de Carbono';
    return 'Carbon Market Data';
  };

  const getSubtitle = () => {
    if (locale === 'pt') return 'Dados autoritativos de fontes confiáveis do setor';
    if (locale === 'es') return 'Datos autoritativos de fuentes confiables de la industria';
    return 'Authoritative data from trusted industry sources';
  };

  const getDisclaimer = () => {
    if (locale === 'pt') return '* Dados de 2025. Fontes: Banco Mundial, Ecosystem Marketplace, SFB, IEA';
    if (locale === 'es') return '* Datos de 2025. Fuentes: Banco Mundial, Ecosystem Marketplace, SFB, IEA';
    return '* Data from 2025. Sources: World Bank, Ecosystem Marketplace, SFB, IEA';
  };

  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-green mb-4">
            {getHeading()}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {getSubtitle()}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300"
            >
              {/* Value and Trend */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-bold text-forest-green">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {stat.trend}
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="text-slate-700 font-medium mb-4 text-sm leading-relaxed">
                {stat.label}
              </p>

              {/* Source */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  <span className="font-medium">{tStats('source')}:</span> {stat.source}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400">
          {getDisclaimer()}
        </p>
      </div>
    </section>
  );
}
