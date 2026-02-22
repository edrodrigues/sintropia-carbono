"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useState, useMemo } from "react";
import { carbonProjectsData, countryToContinent, getStats, type CarbonProject } from "@/data/carbon-plan";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const countryColors = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#06b6d4",
  "#a855f7",
];

const continentColors: Record<string, string> = {
  "South America": "#22c55e",
  "Africa": "#f59e0b",
  "Asia": "#3b82f6",
  "Europe": "#8b5cf6",
  "North America": "#ef4444",
  "Central America": "#ec4899",
  "Oceania": "#14b8a6",
  Unknown: "#6b7280",
};

export function CarbonPlanChart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"country" | "name">("country");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const stats = useMemo(() => getStats(), []);

  const filteredProjects = useMemo(() => {
    let filtered = [...carbonProjectsData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p: CarbonProject) =>
          p.name.toLowerCase().includes(term) ||
          p.country.toLowerCase().includes(term) ||
          p.project_id.toLowerCase().includes(term)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter((p: CarbonProject) => p.country === selectedCountry);
    }

    if (selectedType) {
      filtered = filtered.filter((p: CarbonProject) => {
        if (selectedType === "forest") return p.category === "forest";
        if (selectedType === "other") return p.category !== "forest";
        return true;
      });
    }

    filtered.sort((a: CarbonProject, b: CarbonProject) => {
      let comparison = 0;
      if (sortBy === "country") {
        comparison = a.country.localeCompare(b.country);
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, selectedCountry, selectedType, sortBy, sortOrder]);

  const countryStats = useMemo(() => {
    const sorted = Object.entries(stats.countryStats).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 15);
  }, [stats]);

  const continentStats = useMemo(() => {
    const contStats: Record<string, number> = {};
    carbonProjectsData.forEach((p: CarbonProject) => {
      const continent = countryToContinent[p.country] || "Unknown";
      contStats[continent] = (contStats[continent] || 0) + 1;
    });
    return Object.entries(contStats).sort((a, b) => b[1] - a[1]);
  }, []);

  const countryChartData = {
    labels: countryStats.map(([country]) => country),
    datasets: [
      {
        label: "Projetos",
        data: countryStats.map(([, count]) => count),
        backgroundColor: countryColors.slice(0, countryStats.length),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const continentChartData = {
    labels: continentStats.map(([continent]) => continent),
    datasets: [
      {
        data: continentStats.map(([, count]) => count),
        backgroundColor: continentStats.map(([continent]) => continentColors[continent] || "#6b7280"),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const typeChartData = {
    labels: ["Florestal", "Outros"],
    datasets: [
      {
        data: [stats.forestProjects, stats.totalProjects - stats.forestProjects],
        backgroundColor: ["#22c55e", "#6b7280"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(0, 0, 0, 0.05)" } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 20, usePointStyle: true, font: { size: 12 } },
      },
    },
  };

  const uniqueCountries = Array.from(new Set(carbonProjectsData.map((p: CarbonProject) => p.country))).sort();

  const protocolStats = useMemo(() => {
    const protStats: Record<string, number> = {};
    carbonProjectsData.forEach((p: CarbonProject) => {
      const protocols = p.protocol.split("/");
      protocols.forEach(prot => {
        const clean = prot.trim();
        protStats[clean] = (protStats[clean] || 0) + 1;
      });
    });
    return Object.entries(protStats).sort((a, b) => b[1] - a[1]);
  }, []);

  const protocolChartData = {
    labels: protocolStats.map(([protocol]) => protocol),
    datasets: [
      {
        label: "Projetos",
        data: protocolStats.map(([, count]) => count),
        backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const protocolLabels: Record<string, string> = {
    "VM0047": "Plantar árvores e medir crescimento via satélite",
    "VM0048": "Evitar desmatamento em nível de estado/país, distribuindo créditos entre projetos",
    "VM0007": "Manual das regras de REDD+ (versão antiga)",
    "VM0038": "Recarregar carro elétrico = gerar crédito de carbono",
    "ACM0022": "Tratamento de resíduos sólidos",
    "AMS-I-D": "Geração hidrelétrica",
    "AMS-I-F": "Geração solar/eólica",
    "AMS-III-D": "Eficiência energética",
  };

  const protocolDescriptions: Record<string, string> = {
    "VM0047": "Afforestation, Reforestation and Revegetation (ARR) - Plantio de árvores em áreas degradadas, com monitoramento por satélite",
    "VM0048": "REDD+ (Reducing Emissions from Deforestation) - Evitar desmatamento em escala jurisdicional, distribuindo créditos entre projetos",
    "VM0007": "REDD+ Methodology Framework - Framework metodológico para projetos REDD+ (versão anterior)",
    "VM0038": "Eletrificação de Veículos - Créditos por carregar veículos elétricos ou substituir veículos a combustão",
    "ACM0022": "Decomposição de Resíduos - Tratamento de resíduos orgânicos sólidos via compostagem ou digestão anaeróbica",
    "AMS-I-D": "Energia Renovável Conectada à Rede - Geração de energia renovável conectada à rede elétrica",
    "AMS-I-F": "Energia Renovável para Carregamento de Veículos - Energia renovável destinada ao carregamento de veículos elétricos",
    "AMS-III-D": "Eficiência Energética - Melhorias de eficiência energética em processos industriais",
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Total de Projetos</p>
          <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">{stats.totalProjects}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Projetos Florestais</p>
          <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.forestProjects}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Países</p>
          <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.countries}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Continentes</p>
          <h3 className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.continents}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mapa Global de Projetos</h3>
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Visualização geográfica em desenvolvimento
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {continentStats.map(([continent, count]) => (
              <span
                key={continent}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: continentColors[continent] + "20", color: continentColors[continent] }}
              >
                {continent}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Projetos por País</h3>
          <div className="h-[300px]">
            <Bar data={countryChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Por Continente</h3>
          <div className="h-[300px]">
            <Doughnut data={continentChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tipo de Projeto</h3>
          <div className="h-[250px]">
            <Doughnut data={typeChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Metodologias Verra</h3>
          <div className="h-[250px]">
            <Bar data={protocolChartData} options={chartOptions} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {protocolStats.map(([protocol, count]) => (
              <div key={protocol} className="relative group">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium cursor-help">
                  {protocol}: {count}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {protocolDescriptions[protocol] || "Metodologia Verra"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lista de Projetos</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCountry}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos os países</option>
            {uniqueCountries.map((country: string) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos os tipos</option>
            <option value="forest">Florestal</option>
            <option value="other">Outros</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500"
                  onClick={() => { setSortBy("country"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}
                >
                  País {sortBy === "country" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Projeto</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Tipo</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.slice(0, 50).map((project: CarbonProject) => (
                <tr key={project.project_id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {project.country}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.project_id}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.project_type.includes("REDD")
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : project.project_type.includes("Afforestation")
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {project.project_type === "Unknown" ? "Outros" : project.project_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.category === "forest"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {project.category === "forest" ? "🌲 Florestal" : "📌 Outro"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length > 50 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Mostrando 50 de {filteredProjects.length} projetos
          </p>
        )}
        
        {filteredProjects.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhum projeto encontrado com os filtros selecionados.
          </p>
        )}
      </div>
    </div>
  );
}
