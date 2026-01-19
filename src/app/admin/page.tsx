import DashboardCards from "@/components/admin/dashboard-cards";
import SalesChart from "@/components/admin/sales-chart";
import CategoryPieChart from "@/components/admin/category-pie-chart";
import CartAnalysisChart from "@/components/admin/cart-analysis-chart";
import QuickActions from "@/components/admin/quick-actions";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      <QuickActions />

      <DashboardCards />

      <div className="grid lg:grid-cols-2 gap-8">
        <SalesChart />
        <CategoryPieChart />
      </div>

      <CartAnalysisChart />
    </div>
  );
}
