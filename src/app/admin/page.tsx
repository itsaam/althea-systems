import DashboardCards from "@/components/admin/dashboard-cards";
import SalesChart from "@/components/admin/sales-chart";
import CategoryPieChart from "@/components/admin/category-pie-chart";
import CartAnalysisChart from "@/components/admin/cart-analysis-chart";
import QuickActions from "@/components/admin/quick-actions";
import {
  RecentOrdersBlock,
  TopProductsBlock,
} from "@/components/admin/dashboard-sidebars";
import { AdminPageHeader } from "@/components/admin/shell/page-header";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-12">
      <AdminPageHeader
        eyebrow="Admin — Dashboard · FR"
        index="001 / Overview"
        title="Vue d'ensemble"
        description="Indicateurs en temps réel, ventes, catalogue et activité client — rafraîchis à chaque chargement."
      />

      <QuickActions />

      <DashboardCards />

      <div className="grid gap-12 lg:grid-cols-2">
        <SalesChart />
        <CategoryPieChart />
      </div>

      <CartAnalysisChart />

      <div className="grid gap-12 lg:grid-cols-2">
        <TopProductsBlock />
        <RecentOrdersBlock />
      </div>
    </div>
  );
}
