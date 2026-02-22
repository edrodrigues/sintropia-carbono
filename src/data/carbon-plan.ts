export interface CarbonProject {
  project_id: string;
  name: string;
  category: string;
  country: string;
  project_type: string;
  proponent: string;
  protocol: string;
}

export const carbonProjectsData: CarbonProject[] = [
  { project_id: "VCS5908", name: "Electric Mobility Program Colombia", category: "unknown", country: "Colombia", project_type: "Unknown", proponent: "Grutter Consulting AG", protocol: "VM0038" },
  { project_id: "VCS5896", name: "Project Sierra Verde", category: "forest", country: "Philippines", project_type: "Afforestation + Reforestation", proponent: "Arkadiah Technology Pte. Ltd.", protocol: "VM0047" },
  { project_id: "VCS5897", name: "HARIT BHARAT - TELANGANA", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "Iora Ecological Solutions Private Limited", protocol: "VM0047" },
  { project_id: "VCS5889", name: "Cabeceira do Xingu REDD Project", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "CABECEIRA DO XINGU LTDA", protocol: "VM0048" },
  { project_id: "VCS5879", name: "Amazon Forest Landscape Restoration", category: "forest", country: "Peru", project_type: "Afforestation + Reforestation", proponent: "Amazon Restoration Company S.A.C.", protocol: "VM0047" },
  { project_id: "VCS5872", name: "Project Aranyam", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "Clean Max Aranyam Private Limited", protocol: "VM0047" },
  { project_id: "VCS5858", name: "Reforestation Ndélélé and Bétaré-Oya", category: "forest", country: "Cameroon", project_type: "Afforestation + Reforestation", proponent: "Terraformation Inc.", protocol: "VM0047" },
  { project_id: "VCS5842", name: "UNITÁN II Afforestation Project", category: "forest", country: "Argentina", project_type: "Afforestation + Reforestation", proponent: "UNITAN SAICA", protocol: "VM0047" },
  { project_id: "VCS5837", name: "Amazon HDF XARR Grouped Project", category: "forest", country: "Brazil", project_type: "Afforestation + Reforestation", proponent: "Rainforest Defense Company", protocol: "VM0047" },
  { project_id: "VCS5836", name: "Amazon HDF XREDD Grouped Project", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "Rainforest Defense Company", protocol: "VM0048" },
  { project_id: "VCS5821", name: "TREES FOR FARMERS, AGROFORESTRY", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "Fidelis Enviro Private Limited", protocol: "VM0047" },
  { project_id: "VCS5820", name: "The Gamboma and Mbon Afforestation Project", category: "forest", country: "Congo Republic", project_type: "Afforestation + Reforestation", proponent: "EcoNetix GmbH", protocol: "VM0047" },
  { project_id: "VCS5818", name: "Avé Ga Grouped Project", category: "forest", country: "Togo", project_type: "Afforestation + Reforestation", proponent: "Reforest'Action", protocol: "VM0047" },
  { project_id: "VCS5816", name: "Massangui Forest Conservation", category: "forest", country: "Congo Republic", project_type: "Afforestation + Reforestation", proponent: "EcoNetix GmbH", protocol: "VM0047/VM0048" },
  { project_id: "VCS5770", name: "REDD+ Sertão Veredas", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "Multiple Proponents", protocol: "VM0048" },
  { project_id: "VCS5763", name: "Grande Sun Gabon REDD+ Project", category: "forest", country: "Gabon", project_type: "REDD+", proponent: "Hainan Grande Sun Carbon Energy Technology Co.", protocol: "VM0007/VM0048" },
  { project_id: "VCS5755", name: "SATROKALA ARR GROUPED PROJECT", category: "forest", country: "Madagascar", project_type: "Afforestation + Reforestation", proponent: "JTF Madagascar Sarl", protocol: "VM0047" },
  { project_id: "VCS5730", name: "MoRe Malawi ARR Project", category: "forest", country: "Malawi", project_type: "Afforestation + Reforestation", proponent: "Mamaland Company", protocol: "VM0047" },
  { project_id: "VCS5732", name: "MoRe Malawi REDD Project", category: "forest", country: "Malawi", project_type: "REDD+", proponent: "Mamaland Company", protocol: "VM0048" },
  { project_id: "VCS5718", name: "RENEW TARU ODISHA", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "ReNew Power Synergy Private Limited", protocol: "VM0047" },
  { project_id: "VCS5709", name: "TRIUNFO DO XINGU ARR PROJECT", category: "forest", country: "Brazil", project_type: "Afforestation + Reforestation", proponent: "TRIUNFO DO XINGU", protocol: "VM0047" },
  { project_id: "VCS5704", name: "Native Species Restoration Portugal", category: "forest", country: "Portugal", project_type: "Afforestation + Reforestation", proponent: "STX Commodities B.V.", protocol: "VM0047" },
  { project_id: "VCS5706", name: "Amau Ganai REDD+ Project", category: "forest", country: "Papua New Guinea", project_type: "REDD+", proponent: "Marki Holdings Limited", protocol: "VM0007/VM0048" },
  { project_id: "VCS5697", name: "Swiftgreen: Agroforestry", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "Climeverse Private Limited", protocol: "VM0047" },
  { project_id: "VCS5695", name: "Siluk Peatlands Conservation", category: "forest", country: "Indonesia", project_type: "REDD+", proponent: "PT. Annisa Surya Kencana", protocol: "VM0007" },
  { project_id: "VCS5676", name: "MISITU ARR PROJECT", category: "forest", country: "Kenya", project_type: "Afforestation + Reforestation", proponent: "AKILI HOLDINGS LIMITED", protocol: "VM0047" },
  { project_id: "VCS5670", name: "Puerto Valle Nuevo Afforestation", category: "forest", country: "Argentina", project_type: "Afforestation + Reforestation", proponent: "Cambium Earth S.L.", protocol: "VM0047" },
  { project_id: "VCS5671", name: "Lisala REDD+ Project", category: "forest", country: "DR Congo", project_type: "REDD+", proponent: "Taranis Operations Limited", protocol: "VM0007" },
  { project_id: "VCS5672", name: "Lukolela REDD+ Project", category: "forest", country: "DR Congo", project_type: "REDD+", proponent: "Taranis Operations Limited", protocol: "VM0007" },
  { project_id: "VCS5655", name: "Lumwana REDD+ Project", category: "forest", country: "Zambia", project_type: "REDD+", proponent: "Lumwana Mining Company Ltd.", protocol: "VM0048" },
  { project_id: "VCS5643", name: "Oyu – Green Growth Uganda", category: "forest", country: "Uganda", project_type: "Afforestation + Reforestation", proponent: "OYU Green Private Limited", protocol: "VM0047" },
  { project_id: "VCS5637", name: "REDD+ PROJECT ARARA PEOPLE", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "Multiple Proponents", protocol: "VM0048" },
  { project_id: "VCS5634", name: "Lower Sepik REDD+ Project", category: "forest", country: "Papua New Guinea", project_type: "REDD+", proponent: "Mapac Marki Limited", protocol: "VM0007/VM0048" },
  { project_id: "VCS5628", name: "Greening of the dried Aral Sea", category: "forest", country: "Kazakhstan", project_type: "Afforestation + Reforestation", proponent: "DGB Project Management BV", protocol: "VM0047" },
  { project_id: "VCS5620", name: "Carbon Agroforestry Indonesia", category: "forest", country: "Indonesia", project_type: "Afforestation + Reforestation", proponent: "Multiple Proponents", protocol: "VM0047" },
  { project_id: "VCS5615", name: "RAFT Project", category: "forest", country: "Malawi", project_type: "Afforestation + Reforestation", proponent: "Bridge Carbon NBS Private Limited", protocol: "VM0047" },
  { project_id: "VCS5594", name: "Climate Resilient Bamboo Plantations", category: "forest", country: "India", project_type: "Afforestation + Reforestation", proponent: "Infinite Environmental Solutions Limited", protocol: "VM0047" },
  { project_id: "VCS5587", name: "Conkouati-Douli REDD+ Project", category: "forest", country: "Congo Republic", project_type: "REDD+", proponent: "Noé", protocol: "VM0007" },
  { project_id: "VCS5585", name: "PROJECT LESTARI", category: "forest", country: "Indonesia", project_type: "REDD+", proponent: "PT. AGRA INTI INVESTAMA", protocol: "VM0007/VM0048" },
  { project_id: "VCS5578", name: "Re.green Landscapes", category: "forest", country: "Brazil", project_type: "Afforestation + Reforestation", proponent: "Re.Green Participações S.A.", protocol: "VM0047" },
  { project_id: "VCS5565", name: "Projeto REDD+ Xikrin do Cateté", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "Multiple Proponents", protocol: "VM0048" },
  { project_id: "VCS5562", name: "Galician Atlantic Forest Restoration", category: "forest", country: "Spain", project_type: "Afforestation + Reforestation", proponent: "Multiple Proponents", protocol: "VM0047" },
  { project_id: "VCS5556", name: "Green Samar", category: "forest", country: "Philippines", project_type: "Afforestation + Reforestation", proponent: "aDryada", protocol: "VM0047" },
  { project_id: "VCS5532", name: "Santa Barbara Mountain REDD+", category: "forest", country: "Honduras", project_type: "REDD+", proponent: "Higuertropic de Honduras", protocol: "VM0048" },
  { project_id: "VCS5527", name: "Mandassaia Farm Carbon REDD+", category: "forest", country: "Brazil", project_type: "REDD+", proponent: "Multiple Proponents", protocol: "VM0048" },
];

export const countryToContinent: Record<string, string> = {
  Colombia: "South America",
  Philippines: "Asia",
  India: "Asia",
  Canada: "North America",
  Brazil: "South America",
  Peru: "South America",
  Cameroon: "Africa",
  Argentina: "South America",
  "Congo Republic": "Africa",
  Togo: "Africa",
  Senegal: "Africa",
  Malawi: "Africa",
  Gabon: "Africa",
  Madagascar: "Africa",
  Kenya: "Africa",
  Uganda: "Africa",
  Zambia: "Africa",
  "DR Congo": "Africa",
  Portugal: "Europe",
  "Papua New Guinea": "Oceania",
  Indonesia: "Asia",
  Kazakhstan: "Asia",
  Spain: "Europe",
  Honduras: "Central America",
  Mongolia: "Asia",
  "United States": "North America",
  China: "Asia",
  "South Africa": "Africa",
};

export const getStats = () => {
  const totalProjects = carbonProjectsData.length;
  const forestProjects = carbonProjectsData.filter(p => p.category === "forest").length;
  const countries = new Set(carbonProjectsData.map(p => p.country)).size;
  const continents = new Set(carbonProjectsData.map(p => countryToContinent[p.country] || "Unknown")).size;
  
  const countryStats: Record<string, number> = {};
  carbonProjectsData.forEach(p => {
    countryStats[p.country] = (countryStats[p.country] || 0) + 1;
  });
  
  const typeStats: Record<string, number> = {};
  carbonProjectsData.forEach(p => {
    const type = p.project_type === "Unknown" ? "Outros" : p.project_type;
    typeStats[type] = (typeStats[type] || 0) + 1;
  });
  
  return {
    totalProjects,
    forestProjects,
    countries,
    continents,
    countryStats,
    typeStats,
  };
};
