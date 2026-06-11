import { getTranslations } from "next-intl/server";
import { BarChart3, Users, Lightbulb, Code2 } from "lucide-react";

interface FeatureItem {
  icon: typeof BarChart3;
  title: string;
  desc: string;
}

export async function FeaturesSection({ locale }: { locale: string }) {
  const tFeatures = await getTranslations({ locale, namespace: "Index.features" });

  const features: FeatureItem[] = [
    { icon: BarChart3, title: tFeatures("brazilianData.title"), desc: tFeatures("brazilianData.desc") },
    { icon: Users, title: tFeatures("marketIntelligence.title"), desc: tFeatures("marketIntelligence.desc") },
    { icon: Lightbulb, title: tFeatures("activeCommunity.title"), desc: tFeatures("activeCommunity.desc") },
    { icon: Code2, title: tFeatures("openApi.title"), desc: tFeatures("openApi.desc") },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-forest-green text-center mb-12">
          {tFeatures("title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-premium-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5 group-hover:bg-forest-green transition-colors duration-300">
                  <Icon className="w-6 h-6 text-forest-green group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-forest-green mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
