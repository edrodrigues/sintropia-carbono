import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { StreakUpdater } from "@/components/gamification/StreakUpdater";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <StreakUpdater>
        <main id="main-content" className="flex-1 pt-16 lg:pt-24 pb-8 lg:pb-12" tabIndex={-1}>
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </StreakUpdater>
      <Footer />
    </div>
  );
}
