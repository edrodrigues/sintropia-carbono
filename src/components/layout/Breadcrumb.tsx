"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Início", href: "/" }];

    if (paths.length === 0) {
      return breadcrumbs;
    }

    const pathLabels: Record<string, string> = {
      dashboard: "Painel",
      feed: "Feed",
      profiles: "Perfis",
      profile: "Perfil",
      leaderboard: "Ranking",
      mod: "Moderação",
      posts: "Posts",
      u: "Perfil",
      "carbono-brasil": "Carbono Brasil",
      "carbono-mundo": "Carbono Mundo",
      "carbono-precos": "Preços Carbono",
      "carbono-projetos": "Projetos Carbono",
      certificadoras: "Certificadoras",
      "irec-brasil": "IREC Brasil",
      "irec-mundo": "IREC Mundo",
      "irec-precos": "IREC Preços",
      login: "Login",
      register: "Cadastro",
      "forgot-password": "Esqueci a Senha",
      "reset-password": "Redefinir Senha",
    };

    let currentPath = "";

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      const label = pathLabels[path] || path;
      
      if (isLast) {
        breadcrumbs.push({ label: path.startsWith("@") ? path.slice(1) : label });
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <span className="mx-1">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
