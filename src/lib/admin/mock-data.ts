/**
 * Mock data pour le panel admin en mode dégradé.
 * Utilisé quand la base de données est indisponible (dev backdoor, pas de DATABASE_URL).
 * Les composants admin dégradent gracieusement vers ces valeurs.
 */

export const MOCK_KPIS = {
  revenue: {
    day: 4820,
    week: 28450,
    month: 118920,
  },
  ordersToday: 14,
  lowStockAlerts: 3,
  unreadMessages: 7,
  deltas: {
    revenue: 12.4,
    orders: -3.2,
    stock: 0,
    messages: 2,
  },
};

export const MOCK_SALES_7DAYS = [
  { date: "Lun", sales: 3240, orders: 11 },
  { date: "Mar", sales: 4180, orders: 14 },
  { date: "Mer", sales: 2960, orders: 9 },
  { date: "Jeu", sales: 5120, orders: 17 },
  { date: "Ven", sales: 6340, orders: 21 },
  { date: "Sam", sales: 4720, orders: 15 },
  { date: "Dim", sales: 1890, orders: 6 },
];

export const MOCK_SALES_5WEEKS = [
  { date: "S-4", sales: 22140, orders: 74 },
  { date: "S-3", sales: 25890, orders: 86 },
  { date: "S-2", sales: 19420, orders: 62 },
  { date: "S-1", sales: 28450, orders: 91 },
  { date: "S0", sales: 24780, orders: 79 },
];

export const MOCK_CATEGORIES = [
  { name: "Électronique", value: 48200, percentage: 38.4 },
  { name: "Accessoires", value: 31450, percentage: 25.1 },
  { name: "Mobilier", value: 22890, percentage: 18.3 },
  { name: "Textile", value: 14720, percentage: 11.7 },
  { name: "Autre", value: 8190, percentage: 6.5 },
];

export const MOCK_CART_ANALYSIS = [
  {
    period: "Lun",
    categories: { "Électronique": 1240, "Accessoires": 820, "Mobilier": 640 },
  },
  {
    period: "Mar",
    categories: { "Électronique": 1580, "Accessoires": 920, "Mobilier": 780 },
  },
  {
    period: "Mer",
    categories: { "Électronique": 1120, "Accessoires": 710, "Mobilier": 530 },
  },
  {
    period: "Jeu",
    categories: { "Électronique": 2040, "Accessoires": 1180, "Mobilier": 910 },
  },
  {
    period: "Ven",
    categories: { "Électronique": 2480, "Accessoires": 1420, "Mobilier": 1140 },
  },
  {
    period: "Sam",
    categories: { "Électronique": 1820, "Accessoires": 1080, "Mobilier": 820 },
  },
  {
    period: "Dim",
    categories: { "Électronique": 720, "Accessoires": 410, "Mobilier": 280 },
  },
];

export const MOCK_TOP_PRODUCTS = [
  { id: "mock-1", name: "Référence A-100", sold: 142, revenue: 18420 },
  { id: "mock-2", name: "Référence B-220", sold: 98, revenue: 14210 },
  { id: "mock-3", name: "Référence C-340", sold: 76, revenue: 11890 },
  { id: "mock-4", name: "Référence D-480", sold: 54, revenue: 8720 },
  { id: "mock-5", name: "Référence E-510", sold: 42, revenue: 6340 },
];

export const MOCK_RECENT_ORDERS = [
  { id: "ORD-00142", customer: "A. Durand", total: 428, status: "PROCESSING" },
  { id: "ORD-00141", customer: "M. Leroy", total: 189, status: "SHIPPED" },
  { id: "ORD-00140", customer: "J. Martin", total: 742, status: "DELIVERED" },
  { id: "ORD-00139", customer: "S. Bernard", total: 96, status: "PENDING" },
  { id: "ORD-00138", customer: "C. Petit", total: 312, status: "DELIVERED" },
];

/**
 * Flag global exposé par les composants admin quand ils tombent en fallback.
 * Lu par la bannière "mode dégradé" via un event bus léger.
 */
export const DEGRADED_MODE_EVENT = "althea-admin-degraded";

export function signalDegradedMode() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DEGRADED_MODE_EVENT));
}
