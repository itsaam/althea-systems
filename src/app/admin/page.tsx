import DashboardCards from "@/components/admin/dashboard-cards";
import SalesChart from "@/components/admin/sales-chart";
import CategoryPieChart from "@/components/admin/category-pie-chart";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardCards />
      <div className="grid md:grid-cols-2 gap-8">
        <SalesChart />
        <CategoryPieChart />
      </div>
    </div>
  );
}
