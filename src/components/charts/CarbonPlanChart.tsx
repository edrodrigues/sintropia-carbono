"use client";

import { useState, useMemo, useEffect } from "react";
import { carbonProjectsData as localData, countryToContinent, getStats, type CarbonProject } from "@/data/carbon-plan";
import { Card, Metric, MetricSubtitle, Title, Badge, TextInput, Select, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, BarChart, DonutChart, BarList, Tooltip } from "@/components/ui/tremor";

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

const chartColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

interface ApiResponse {
  projects: CarbonProject[];
  stats: {
    totalProjects: number;
    forestProjects: number;
    countries: number;
    continents: number;
    totalCredits: number;
    countryStats: Record<string, number>;
    continentStats: Record<string, number>;
    categoryStats: Record<string, number>;
    creditsByCountry: Record<string, number>;
    vintageStats: Record<string, number>;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
  fallback?: boolean;
}

export function CarbonPlanChart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"country" | "name">("country");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [stats, setStats] = useState<{
    totalProjects: number;
    forestProjects: number;
    countries: number;
    continents: number;
    totalCredits: number;
    countryStats: Record<string, number>;
    continentStats: Record<string, number>;
    categoryStats: Record<string, number>;
    creditsByCountry: Record<string, number>;
    vintageStats: Record<string, number>;
  } | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/carbon-projects?limit=1000');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: ApiResponse = await response.json();

        if (data.error && data.fallback) {
          throw new Error('Using local data');
        }

        setProjects(data.projects);
        setStats(data.stats);
        setUseFallback(false);
      } catch (err) {
        console.log('Using fallback data:', err);
        setUseFallback(true);
        // Use local data as fallback
        const localStats = getStats();
        setStats({
          totalProjects: localStats.totalProjects,
          forestProjects: localStats.forestProjects,
          countries: localStats.countries,
          continents: localStats.continents,
          totalCredits: 0,
          countryStats: localStats.countryStats,
          continentStats: {},
          categoryStats: {},
          creditsByCountry: {},
          vintageStats: {},
        });
        // Map local data to match API format
        const mappedProjects = localData.map(p => ({
          project_id: p.project_id,
          name: p.name,
          category: p.category,
          country: p.country,
          project_type: p.project_type,
          proponent: p.proponent,
          protocol: p.protocol,
        }));
        setProjects(mappedProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

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
      filtered = filtered.filter((p: CarbonProject) => p.category === selectedType);
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
  }, [projects, searchTerm, selectedCountry, selectedType, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountry, selectedType]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const countryStatsData = useMemo(() => {
    if (!stats) return [];
    const sorted = Object.entries(stats.countryStats).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 15).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const continentStatsData = useMemo(() => {
    if (!stats || !stats.continentStats || Object.keys(stats.continentStats).length === 0) {
      // Calculate from local data if not available from API
      const contStats: Record<string, number> = {};
      localData.forEach((p: CarbonProject) => {
        const continent = countryToContinent[p.country] || "Unknown";
        contStats[continent] = (contStats[continent] || 0) + 1;
      });
      return Object.entries(contStats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({
          name,
          value,
          color: continentColors[name] || "#6b7280"
        }));
    }
    return Object.entries(stats.continentStats)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: continentColors[name] || "#6b7280"
      }));
  }, [stats]);

  const typeChartData = useMemo(() => {
    if (!stats) return [
      { name: "Florestal", value: 0, color: "#22c55e" },
      { name: "Outros", value: 0, color: "#6b7280" },
    ];
    return [
      { name: "Florestal", value: stats.forestProjects, color: "#22c55e" },
      { name: "Outros", value: stats.totalProjects - stats.forestProjects, color: "#6b7280" },
    ];
  }, [stats]);

  const categoryColors: Record<string, string> = {
    "forest": "#22c55e",
    "agriculture": "#f59e0b",
    "renewable-energy": "#3b82f6",
    "fuel-switching": "#ef4444",
    "biochar": "#8b5cf6",
    "energy-efficiency": "#ec4899",
    "land-use": "#14b8a6",
    "carbon-capture": "#6366f1",
    "ghg-management": "#84cc16",
    "unknown": "#6b7280",
  };

  const PortugueseCategoryNames: Record<string, string> = {
    "forest": "Florestal",
    "agriculture": "Agricultura",
    "renewable-energy": "Energia Renovável",
    "fuel-switching": "Subst. Combustível",
    "biochar": "Biochar",
    "energy-efficiency": "Eficiência Energética",
    "land-use": "Uso da Terra",
    "carbon-capture": "Captura de Carbono",
    "ghg-management": "Gestão de GEE",
    "unknown": "Pendente",
  };

  const categoryChartData = useMemo(() => {
    if (!stats || !stats.categoryStats) return [];

    const entries = Object.entries(stats.categoryStats)
      .sort((a, b) => b[1] - a[1]);

    const topCount = 6;
    const topEntries = entries.slice(0, topCount);
    const otherEntries = entries.slice(topCount);

    const result = topEntries.map(([name, value]) => ({
      name: PortugueseCategoryNames[name] || name,
      value,
      color: categoryColors[name] || "#94a3b8"
    }));

    if (otherEntries.length > 0) {
      const othersValue = otherEntries.reduce((sum, [_, val]) => sum + val, 0);
      result.push({
        name: "Outros",
        value: othersValue,
        color: "#94a3b8" // Slate-400 for 'Others'
      });
    }

    return result;
  }, [stats]);

  const creditsByCountryData = useMemo(() => {
    if (!stats || !stats.creditsByCountry) return [];
    return Object.entries(stats.creditsByCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [stats]);

  const vintageChartData = useMemo(() => {
    if (!stats || !stats.vintageStats) return [];
    return Object.entries(stats.vintageStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));
  }, [stats]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(projects.map((p: CarbonProject) => p.country))).sort();
  }, [projects]);

  const categoryOptions = useMemo(() => {
    if (!stats?.categoryStats) return [];
    return Object.keys(stats.categoryStats).map(cat => ({
      value: cat,
      label: PortugueseCategoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [stats]);

  const getBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "forest": "green",
      "agriculture": "amber",
      "renewable-energy": "blue",
      "fuel-switching": "red",
      "biochar": "violet",
      "energy-efficiency": "pink",
      "land-use": "emerald",
      "carbon-capture": "indigo",
      "ghg-management": "lime",
      "unknown": "gray",
    };
    return (colors[category] || "gray") as any;
  };

  const getTypeBadgeColor = (projectType: string): "green" | "emerald" | "gray" => {
    if (projectType?.includes("REDD")) return "green";
    if (projectType?.includes("Afforestation")) return "emerald";
    return "gray";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {useFallback && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
          Usando dados locais. O banco de dados não está disponível.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <MetricSubtitle>Total de Projetos</MetricSubtitle>
          <Metric>{stats?.totalProjects || 0}</Metric>
        </Card>
        <Card>
          <MetricSubtitle>Créditos Emitidos</MetricSubtitle>
          <Metric className="text-green-600 dark:text-green-400">
            {stats?.totalCredits ? (stats.totalCredits / 1000000).toFixed(1) + 'M' : '0'}
          </Metric>
        </Card>
        <Card>
          <MetricSubtitle>Países</MetricSubtitle>
          <Metric className="text-purple-600 dark:text-purple-400">{stats?.countries || 0}</Metric>
        </Card>
        <Card>
          <MetricSubtitle>Categorias</MetricSubtitle>
          <Metric className="text-cyan-600 dark:text-cyan-400">
            {stats?.categoryStats ? Object.keys(stats.categoryStats).length : 0}
          </Metric>
        </Card>
      </div>

      <Card>
        <Title>Mapa Global de Projetos</Title>
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Visualização geográfica em desenvolvimento
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {continentStatsData.map((item) => (
              <Badge key={item.name} color="blue">
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Projetos por País</Title>
          <BarChart data={countryStatsData} />
        </Card>

        <Card>
          <Title>Por Continente</Title>
          <DonutChart data={continentStatsData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Title>Projetos por Categoria</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <DonutChart data={categoryChartData} showLegend={false} className="h-[240px]" />
            <div className="space-y-4">
              <BarList data={categoryChartData} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Title className="mb-0 text-sm xl:text-base">Top 10 Países</Title>
            <Tooltip
              className="w-80 whitespace-normal text-left"
              content="A predominância massiva dos EUA no gráfico de créditos deve-se à completude dos dados de emissão: enquanto muitos projetos de outros países estão apenas registrados, os projetos dos EUA possuem o histórico completo de quantidades emitidas (vintages) carregado no sistema."
            >
              <span className="cursor-help text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
              </span>
            </Tooltip>
          </div>
          <div className="mt-2">
            <BarList
              data={creditsByCountryData.map(item => ({
                ...item,
                name: item.name,
                value: item.value,
                color: item.name === "United States" ? "#3b82f6" : "#94a3b8"
              }))}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Title className="mb-0">Créditos Emitidos por Ano (Vintage)</Title>
          <Tooltip
            className="w-72 whitespace-normal text-left"
            content='Observação sobre "Vintage Delay": Você notará que 2024 e 2025 ainda mostram valores menores. Isso é normal e correto tecnicamente, pois no mercado de carbono existe o chamado Reporting Lag: leva-se de 1 a 2 anos para que as reduções de um ano sejam verificadas, registradas e os créditos efetivamente emitidos (Vintages). Conforme novos dados forem inseridos, esses anos "subirão" no gráfico.'
          >
            <span className="cursor-help text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            </span>
          </Tooltip>
        </div>
        <BarChart data={vintageChartData} />
      </Card>

      <Card>
        <Title>Lista de Projetos</Title>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <TextInput
            type="text"
            placeholder="Buscar projeto..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          <Select
            value={selectedCountry}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}
            options={[
              { value: "", label: "Todos os países" },
              ...uniqueCountries.map((c: string) => ({ value: c, label: c }))
            ]}
          />
          <Select
            value={selectedType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
            options={[
              { value: "", label: "Todas as categorias" },
              ...categoryOptions
            ]}
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader onClick={() => { setSortBy("country"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                País {sortBy === "country" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHeader>
              <TableHeader>Projeto</TableHeader>
              <TableHeader>Tipo</TableHeader>
              <TableHeader>Categoria</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProjects.map((project: CarbonProject) => (
              <TableRow key={project.project_id}>
                <TableCell>
                  <Badge color="blue">{project.country}</Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.project_id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color={getTypeBadgeColor(project.project_type)}>
                    {project.project_type === "Unknown" || !project.project_type ? "Outros" : project.project_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={getBadgeColor(project.category)}>
                    {project.category === "forest" ? "🌲 " : "📌 "}
                    {PortugueseCategoryNames[project.category] || project.category}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProjects.length > 50 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} de {filteredProjects.length} projetos
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhum projeto encontrado com os filtros selecionados.
          </p>
        )}
      </Card>
    </div>
  );
}
