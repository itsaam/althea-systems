import { renderToBuffer } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import React from "react";

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPriceTTC: number;
  tvaRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  isPaid: boolean;
  customer: {
    name: string;
    email: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  items: InvoiceItem[];
  shippingCost: number;
  total: number;
}

const COMPANY = {
  name: process.env.COMPANY_NAME ?? "Althea Systems",
  address: process.env.COMPANY_ADDRESS ?? "Paris",
  postalCode: process.env.COMPANY_ZIP ?? "75000",
  city: process.env.COMPANY_CITY ?? "Paris",
  country: process.env.COMPANY_COUNTRY ?? "France",
  email: process.env.COMPANY_EMAIL ?? "contact@althea-systems.com",
  phone: process.env.COMPANY_PHONE ?? "+33 1 23 45 67 89",
  siret: process.env.COMPANY_SIRET ?? "000 000 000 00000",
  vatNumber: process.env.COMPANY_VAT ?? "FR00000000000",
};

// ── Palette Althea ──────────────────────────────────────
// shadow-grey-900 = #1d1619 (foreground noir chaud)
// shadow-grey-500 = #6d5c63 (texte secondaire)
// shadow-grey-200 = #d6cdd1 (bordures)
// shadow-grey-100 = #e9e2e5 (fond alternée)
// shadow-grey-50  = #f4f1f2 (fond page)
// electric-indigo-500 = #5b12ed (accent)

const COLOR = {
  fg: "#1d1619",
  muted: "#6d5c63",
  border: "#d6cdd1",
  bgAlt: "#e9e2e5",
  bgPage: "#f4f1f2",
  accent: "#5b12ed",
  white: "#ffffff",
  green: "#16a34a",
  red: "#dc2626",
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLOR.fg,
    backgroundColor: COLOR.white,
  },

  // ── Header ────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLOR.fg,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 8,
    color: COLOR.muted,
    marginTop: 2,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  invoiceTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.muted,
    textAlign: "right",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  invoiceMeta: {
    fontSize: 9,
    color: COLOR.muted,
    textAlign: "right",
    marginTop: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLOR.fg,
    textAlign: "right",
    marginTop: 2,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-end",
  },
  badgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.white,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Divider ───────────────────────
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
    marginBottom: 24,
  },
  accentLine: {
    borderBottomWidth: 3,
    borderBottomColor: COLOR.accent,
    width: 32,
    marginBottom: 24,
  },

  // ── Addresses ─────────────────────
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  addressBlock: { width: "45%" },
  addressLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.muted,
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  addressName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  addressLine: {
    color: COLOR.muted,
    fontSize: 9,
    marginBottom: 1,
  },

  // ── Table ─────────────────────────
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: COLOR.fg,
    paddingBottom: 6,
    marginBottom: 0,
  },
  tableHeaderText: {
    color: COLOR.fg,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },

  // ── Totals ────────────────────────
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    width: 120,
    textAlign: "right",
    color: COLOR.muted,
    fontSize: 9,
  },
  totalValue: {
    width: 90,
    textAlign: "right",
    fontSize: 9,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 2,
    borderTopColor: COLOR.fg,
    paddingTop: 8,
    marginTop: 8,
  },
  grandLabel: {
    width: 120,
    textAlign: "right",
    color: COLOR.fg,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  grandValue: {
    width: 90,
    textAlign: "right",
    color: COLOR.fg,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },

  // ── Footer ────────────────────────
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: COLOR.muted,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // ── Watermark ─────────────────────
  watermark: {
    position: "absolute",
    top: 300,
    left: 80,
    fontSize: 72,
    fontFamily: "Helvetica-Bold",
    color: COLOR.red,
    opacity: 0.06,
    transform: "rotate(-45deg)",
  },
});

function InvoiceDoc({ data }: { data: InvoiceData }) {
  const rows = data.items.map((item) => {
    const ht = (item.unitPriceTTC / (1 + item.tvaRate)) * item.quantity;
    const ttc = item.unitPriceTTC * item.quantity;
    return { ...item, ht, ttc };
  });

  const shippingHT =
    data.shippingCost > 0 ? data.shippingCost / 1.2 : 0;
  const totalHT =
    rows.reduce((acc, r) => acc + r.ht, 0) + shippingHT;
  const totalTVA =
    rows.reduce((acc, r) => acc + (r.ttc - r.ht), 0) +
    (data.shippingCost > 0 ? data.shippingCost - shippingHT : 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {!data.isPaid && <Text style={s.watermark}>IMPAYÉE</Text>}

        {/* ── Header ──────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brand}>althea.</Text>
            <Text style={s.brandSub}>Medical · Systems</Text>
          </View>
          <View>
            <Text style={s.invoiceTitle}>Facture</Text>
            <Text style={s.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={s.invoiceMeta}>
              {fmtDate(data.createdAt)}
            </Text>
            <View
              style={[
                s.badge,
                {
                  backgroundColor: data.isPaid
                    ? COLOR.green
                    : COLOR.red,
                },
              ]}
            >
              <Text style={s.badgeText}>
                {data.isPaid ? "Payée" : "Impayée"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.accentLine} />

        {/* ── Addresses ───────────────── */}
        <View style={s.addressRow}>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>Émetteur</Text>
            <Text style={s.addressName}>{COMPANY.name}</Text>
            <Text style={s.addressLine}>{COMPANY.address}</Text>
            <Text style={s.addressLine}>
              {COMPANY.postalCode} {COMPANY.city}
            </Text>
            <Text style={s.addressLine}>{COMPANY.country}</Text>
            <Text style={s.addressLine}>{COMPANY.email}</Text>
            <Text style={s.addressLine}>Tél : {COMPANY.phone}</Text>
            <Text style={s.addressLine}>SIRET : {COMPANY.siret}</Text>
            <Text style={s.addressLine}>
              TVA : {COMPANY.vatNumber}
            </Text>
          </View>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>Facturer à</Text>
            <Text style={s.addressName}>{data.customer.name}</Text>
            <Text style={s.addressLine}>{data.customer.email}</Text>
            <Text style={s.addressLine}>{data.customer.address}</Text>
            <Text style={s.addressLine}>
              {data.customer.postalCode} {data.customer.city}
            </Text>
            <Text style={s.addressLine}>{data.customer.country}</Text>
          </View>
        </View>

        {/* ── Table ───────────────────── */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colDesc]}>
            Désignation
          </Text>
          <Text style={[s.tableHeaderText, s.colNum]}>Qté</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>P.U. HT</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>TVA</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>Total TTC</Text>
        </View>

        {rows.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={s.colDesc}>{item.name}</Text>
            <Text style={s.colNum}>{item.quantity}</Text>
            <Text style={s.colNum}>
              {fmt(item.ht / item.quantity)}
            </Text>
            <Text style={s.colNum}>
              {(item.tvaRate * 100).toFixed(0)}%
            </Text>
            <Text style={s.colNum}>{fmt(item.ttc)}</Text>
          </View>
        ))}

        {data.shippingCost > 0 && (
          <View style={s.tableRow}>
            <Text style={s.colDesc}>Frais de livraison</Text>
            <Text style={s.colNum}>1</Text>
            <Text style={s.colNum}>{fmt(shippingHT)}</Text>
            <Text style={s.colNum}>20%</Text>
            <Text style={s.colNum}>{fmt(data.shippingCost)}</Text>
          </View>
        )}

        {/* ── Totals ──────────────────── */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT</Text>
            <Text style={s.totalValue}>{fmt(totalHT)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA</Text>
            <Text style={s.totalValue}>{fmt(totalTVA)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total TTC</Text>
            <Text style={s.grandValue}>{fmt(data.total)}</Text>
          </View>
        </View>

        {/* ── Footer ──────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {COMPANY.name} — SIRET : {COMPANY.siret} — TVA :{" "}
            {COMPANY.vatNumber}
          </Text>
          <Text style={s.footerText}>
            {COMPANY.address}, {COMPANY.postalCode} {COMPANY.city} —{" "}
            {COMPANY.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Génère la facture PDF et retourne un Buffer.
 */
export async function generateInvoicePDF(
  data: InvoiceData
): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDoc data={data} />);
  return Buffer.from(buffer);
}
