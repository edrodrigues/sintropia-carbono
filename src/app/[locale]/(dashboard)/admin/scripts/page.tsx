import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScriptsManager } from "./ScriptsManager";

export default async function AdminScriptsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const scripts = [
    {
      id: "send-newsletter.ts",
      name: "Enviar Newsletter",
      description: "Envia o resumo mensal para todos os usuários cadastrados.",
      icon: "📧",
    },
    {
      id: "sync-contacts-to-resend.ts",
      name: "Sincronizar Contatos",
      description: "Sincroniza os usuários do banco de dados com a audiência do Resend.",
      icon: "🔄",
    },
    {
      id: "send-drip-emails.ts",
      name: "Disparar Campanha Drip",
      description: "Envia os e-mails educacionais da jornada do usuário.",
      icon: "💧",
    },
    {
      id: "check-new-users.ts",
      name: "Verificar Novos Usuários",
      description: "Identifica usuários que ainda não receberam os e-mails iniciais.",
      icon: "👤",
    },
    {
      id: "insert-projects.ts",
      name: "Importar Projetos (CarbonPlan)",
      description: "Importa dados de projetos do CSV para o banco de dados.",
      icon: "📁",
    },
    {
      id: "insert-credits.ts",
      name: "Importar Créditos (CarbonPlan)",
      description: "Importa dados de créditos do CSV para o banco de dados.",
      icon: "💎",
    },
    {
      id: "generate-sql.ts",
      name: "Gerar SQL de Projetos",
      description: "Transforma os dados do CarbonPlan em comandos SQL de inserção.",
      icon: "📜",
    },
    {
      id: "check-domains.ts",
      name: "Validar Domínios",
      description: "Verifica se os domínios de e-mail dos usuários são válidos.",
      icon: "🌐",
    },
    {
      id: "debug-resend.ts",
      name: "Debug Resend",
      description: "Testa a conexão e as configurações da API do Resend.",
      icon: "🛠️",
    },
    {
      id: "summary-drip.ts",
      name: "Resumo Drip",
      description: "Gera um relatório do status atual da campanha drip.",
      icon: "📊",
    },
    {
      id: "verify-drip-status.ts",
      name: "Verificar Status Drip",
      description: "Verifica detalhadamente o progresso de cada usuário na campanha.",
      icon: "✅",
    },
  ];

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          </span>
          Painel de Scripts Administrativos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Gerencie e execute scripts de automação, manutenção e sincronização de dados diretamente pela interface.
        </p>
      </div>

      <ScriptsManager scripts={scripts} />
    </div>
  );
}
