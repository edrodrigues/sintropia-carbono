import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mint-tint/40">
      <div className="text-center px-4">
        <h1 className="text-6xl font-black text-deep-forest mb-4">404</h1>
        <h2 className="text-xl font-bold text-charcoal-ink mb-2">
          Página não encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl bg-deep-forest text-white font-bold shadow-premium hover:bg-charcoal-ink transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
