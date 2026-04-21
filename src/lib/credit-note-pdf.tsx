import { mkdirSync } from "fs";
import { join } from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToFile,
} from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@/lib/prisma";

export interface CreditNoteData {
  creditNumber: string;
  creditNoteId: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  reason: string;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
  address: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string | null;
    city: string;
    postalCode: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    tva: string;
  }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

const TVA_LABELS: Record<string, string> = {
  TVA_20: "20%",
  TVA_10: "10%",
  TVA_5_5: "5,5%",
  TVA_0: "0%",
};

const REASON_LABELS: Record<string, string> = {
  CANCELLATION: "Annulation de commande",
  REFUND: "Remboursement",
  ERROR: "Erreur de facturation",
};

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

// ── Palette Althea (identique à pdf.tsx) ────────────────
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
  docTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.muted,
    textAlign: "right",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  docNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLOR.fg,
    textAlign: "right",
    marginTop: 2,
  },
  docMeta: {
    fontSize: 9,
    color: COLOR.muted,
    textAlign: "right",
    marginTop: 4,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-end",
    backgroundColor: COLOR.red,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.white,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  accentLine: {
    borderBottomWidth: 3,
    borderBottomColor: COLOR.red,
    width: 32,
    marginBottom: 24,
  },

  // ── Reference callout ─────────────
  reference: {
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    paddingLeft: 10,
    marginBottom: 20,
  },
  referenceLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 9,
    color: COLOR.fg,
    lineHeight: 1.4,
  },
  referenceStrong: {
    fontFamily: "Helvetica-Bold",
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
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
  colNumNegative: { flex: 1, textAlign: "right", color: COLOR.red },

  // ── Totals ────────────────────────
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    width: 140,
    textAlign: "right",
    color: COLOR.muted,
    fontSize: 9,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 9,
    color: COLOR.red,
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
    width: 140,
    textAlign: "right",
    color: COLOR.fg,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  grandValue: {
    width: 100,
    textAlign: "right",
    color: COLOR.red,
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
});

function CreditNoteDocument({ data }: { data: CreditNoteData }) {
  const reasonLabel = REASON_LABELS[data.reason] ?? data.reason;
  const now = new Date();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ──────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brand}>althea.</Text>
            <Text style={s.brandSub}>Medical · Systems</Text>
          </View>
          <View>
            <Text style={s.docTitle}>Avoir</Text>
            <Text style={s.docNumber}>{data.creditNumber}</Text>
            <Text style={s.docMeta}>{fmtDate(new Date(data.createdAt))}</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>À rembourser</Text>
            </View>
          </View>
        </View>

        <View style={s.accentLine} />

        {/* ── Référence facture d'origine ──────────────────── */}
        <View style={s.reference}>
          <Text style={s.referenceLabel}>En référence à</Text>
          <Text style={s.referenceText}>
            Facture{" "}
            <Text style={s.referenceStrong}>{data.invoiceNumber}</Text>
            {"  —  Commande "}
            <Text style={s.referenceStrong}>{data.orderNumber}</Text>
            {"\nMotif : "}
            <Text style={s.referenceStrong}>{reasonLabel}</Text>
          </Text>
        </View>

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
            <Text style={s.addressLine}>TVA : {COMPANY.vatNumber}</Text>
          </View>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>Rembourser à</Text>
            <Text style={s.addressName}>
              {data.address.firstName} {data.address.lastName}
            </Text>
            <Text style={s.addressLine}>{data.user.email}</Text>
            <Text style={s.addressLine}>{data.address.street}</Text>
            {data.address.street2 ? (
              <Text style={s.addressLine}>{data.address.street2}</Text>
            ) : null}
            <Text style={s.addressLine}>
              {data.address.postalCode} {data.address.city}
            </Text>
            <Text style={s.addressLine}>{data.address.country}</Text>
          </View>
        </View>

        {/* ── Table ───────────────────── */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colDesc]}>Désignation</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>Qté</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>P.U. HT</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>TVA</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>Total HT</Text>
        </View>

        {data.items.map((item, i) => {
          const totalHT = item.price * item.quantity;
          const tvaLabel = TVA_LABELS[item.tva] ?? item.tva;
          return (
            <View key={i} style={s.tableRow} wrap={false}>
              <Text style={s.colDesc}>{item.name}</Text>
              <Text style={s.colNum}>{item.quantity}</Text>
              <Text style={s.colNumNegative}>-{fmt(item.price)}</Text>
              <Text style={s.colNum}>{tvaLabel}</Text>
              <Text style={s.colNumNegative}>-{fmt(totalHT)}</Text>
            </View>
          );
        })}

        {data.shippingCost > 0 && (
          <View style={s.tableRow}>
            <Text style={s.colDesc}>Frais de livraison</Text>
            <Text style={s.colNum}>1</Text>
            <Text style={s.colNumNegative}>
              -{fmt(data.shippingCost / 1.2)}
            </Text>
            <Text style={s.colNum}>20%</Text>
            <Text style={s.colNumNegative}>-{fmt(data.shippingCost)}</Text>
          </View>
        )}

        {/* ── Totals ──────────────────── */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT</Text>
            <Text style={s.totalValue}>-{fmt(data.subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA</Text>
            <Text style={s.totalValue}>-{fmt(data.tax)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total à rembourser</Text>
            <Text style={s.grandValue}>-{fmt(data.total)}</Text>
          </View>
        </View>

        {/* ── Footer ──────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {COMPANY.name} — SIRET : {COMPANY.siret} — TVA :{" "}
            {COMPANY.vatNumber}
          </Text>
          <Text style={s.footerText}>
            Avoir généré le {fmtDate(now)} — annule partiellement ou totalement
            la facture {data.invoiceNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCreditNotePDF(
  data: CreditNoteData
): Promise<string> {
  const uploadsDir = join(process.cwd(), "public", "invoices");
  mkdirSync(uploadsDir, { recursive: true });

  const filename = `${data.creditNumber}.pdf`;
  const filepath = join(uploadsDir, filename);
  const publicUrl = `/invoices/${filename}`;

  await renderToFile(<CreditNoteDocument data={data} />, filepath);

  await prisma.creditNote.update({
    where: { id: data.creditNoteId },
    data: {},
  });

  return publicUrl;
}
