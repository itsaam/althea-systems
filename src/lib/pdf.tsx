import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import React from "react";
import fs from "fs";
import path from "path";
import sharp from "sharp";

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
  name:       process.env.COMPANY_NAME    ?? "Ma Société SAS",
  address:    process.env.COMPANY_ADDRESS ?? "12 rue de la Paix",
  postalCode: process.env.COMPANY_ZIP     ?? "75001",
  city:       process.env.COMPANY_CITY    ?? "Paris",
  country:    process.env.COMPANY_COUNTRY ?? "France",
  email:      process.env.COMPANY_EMAIL   ?? "contact@masociete.fr",
  phone:      process.env.COMPANY_PHONE   ?? "+33 1 23 45 67 89",
  siret:      process.env.COMPANY_SIRET   ?? "000 000 000 00000",
  vatNumber:  process.env.COMPANY_VAT     ?? "FR00000000000",
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR").format(d);
}

// Convertit le logo SVG en PNG base64 via sharp (@react-pdf/renderer ne supporte pas les SVG)
async function getLogoPng(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logos", "logo-desktop.svg");
    const svgBuffer = fs.readFileSync(logoPath);
    const pngBuffer = await sharp(svgBuffer)
      .resize(240, 80)
      .png()
      .toBuffer();
    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

const s = StyleSheet.create({
  page:         { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a2e" },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  logo:         { width: 120, height: 40, objectFit: "contain" },
  companyName:  { fontSize: 18, fontFamily: "Helvetica-Bold" },
  invoiceTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#4f46e5", textAlign: "right" },
  invoiceMeta:  { fontSize: 9, color: "#6b7280", textAlign: "right", marginTop: 4 },
  badge:        { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, alignSelf: "flex-end" },
  badgeText:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  divider:      { borderBottomWidth: 2, borderBottomColor: "#4f46e5", marginBottom: 16 },
  addressRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  addressBlock: { width: "45%" },
  addressLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", marginBottom: 4 },
  addressName:  { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  addressLine:  { color: "#6b7280", fontSize: 9, marginBottom: 1 },
  tableHeader:  { flexDirection: "row", backgroundColor: "#1a1a2e", padding: 6 },
  tableHeaderText: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow:     { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6 },
  tableRowAlt:  { backgroundColor: "#f3f4f6" },
  colDesc:      { flex: 3 },
  colNum:       { flex: 1, textAlign: "right" },
  totalsBlock:  { marginTop: 12, alignItems: "flex-end" },
  totalRow:     { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  totalLabel:   { width: 120, textAlign: "right", color: "#6b7280" },
  totalValue:   { width: 90, textAlign: "right" },
  grandRow:     { flexDirection: "row", justifyContent: "flex-end", backgroundColor: "#4f46e5", padding: 6, borderRadius: 4, marginTop: 4 },
  grandLabel:   { width: 120, textAlign: "right", color: "#ffffff", fontFamily: "Helvetica-Bold" },
  grandValue:   { width: 90, textAlign: "right", color: "#ffffff", fontFamily: "Helvetica-Bold" },
  footer:       { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText:   { fontSize: 8, color: "#6b7280", textAlign: "center" },
  watermark:    { position: "absolute", top: 280, left: 60, fontSize: 80, fontFamily: "Helvetica-Bold", color: "#ef4444", opacity: 0.07, transform: "rotate(-45deg)" },
});

function InvoiceDoc({ data, logoBase64 }: { data: InvoiceData; logoBase64: string | null }) {
  let totalHT = 0;
  let totalTVA = 0;

  const rows = data.items.map((item) => {
    const ht  = (item.unitPriceTTC / (1 + item.tvaRate)) * item.quantity;
    const ttc = item.unitPriceTTC * item.quantity;
    totalHT  += ht;
    totalTVA += ttc - ht;
    return { ...item, ht, ttc };
  });

  if (data.shippingCost > 0) {
    const shipHT = data.shippingCost / 1.2;
    totalHT  += shipHT;
    totalTVA += data.shippingCost - shipHT;
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {!data.isPaid && <Text style={s.watermark}>IMPAYÉE</Text>}

        {/* Header */}
        <View style={s.headerRow}>
          <View>
            {logoBase64 ? (
              <Image src={logoBase64} style={s.logo} />
            ) : (
              <Text style={s.companyName}>{COMPANY.name}</Text>
            )}
          </View>
          <View>
            <Text style={s.invoiceTitle}>FACTURE</Text>
            <Text style={s.invoiceMeta}>N° {data.invoiceNumber}</Text>
            <Text style={s.invoiceMeta}>Date : {fmtDate(data.createdAt)}</Text>
            <View style={[s.badge, { backgroundColor: data.isPaid ? "#16a34a" : "#dc2626" }]}>
              <Text style={s.badgeText}>{data.isPaid ? "PAYÉE" : "IMPAYÉE"}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* Addresses */}
        <View style={s.addressRow}>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>ÉMETTEUR</Text>
            <Text style={s.addressName}>{COMPANY.name}</Text>
            <Text style={s.addressLine}>{COMPANY.address}</Text>
            <Text style={s.addressLine}>{COMPANY.postalCode} {COMPANY.city}</Text>
            <Text style={s.addressLine}>{COMPANY.country}</Text>
            <Text style={s.addressLine}>Email : {COMPANY.email}</Text>
            <Text style={s.addressLine}>Tél : {COMPANY.phone}</Text>
            <Text style={s.addressLine}>SIRET : {COMPANY.siret}</Text>
            <Text style={s.addressLine}>N° TVA : {COMPANY.vatNumber}</Text>
          </View>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>FACTURER À</Text>
            <Text style={s.addressName}>{data.customer.name}</Text>
            <Text style={s.addressLine}>{data.customer.email}</Text>
            <Text style={s.addressLine}>{data.customer.address}</Text>
            <Text style={s.addressLine}>{data.customer.postalCode} {data.customer.city}</Text>
            <Text style={s.addressLine}>{data.customer.country}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colDesc]}>DÉSIGNATION</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>QTÉ</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>P.U. HT</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>TVA</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>TOTAL TTC</Text>
        </View>

        {rows.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 0 ? s.tableRowAlt : {}]}>
            <Text style={s.colDesc}>{item.name}</Text>
            <Text style={s.colNum}>{item.quantity}</Text>
            <Text style={s.colNum}>{fmt(item.ht / item.quantity)}</Text>
            <Text style={s.colNum}>{(item.tvaRate * 100).toFixed(0)}%</Text>
            <Text style={s.colNum}>{fmt(item.ttc)}</Text>
          </View>
        ))}

        {data.shippingCost > 0 && (
          <View style={[s.tableRow, rows.length % 2 === 0 ? s.tableRowAlt : {}]}>
            <Text style={s.colDesc}>Frais de livraison</Text>
            <Text style={s.colNum}>1</Text>
            <Text style={s.colNum}>{fmt(data.shippingCost / 1.2)}</Text>
            <Text style={s.colNum}>20%</Text>
            <Text style={s.colNum}>{fmt(data.shippingCost)}</Text>
          </View>
        )}

        {/* Totals */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT :</Text>
            <Text style={s.totalValue}>{fmt(totalHT)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA :</Text>
            <Text style={s.totalValue}>{fmt(totalTVA)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>TOTAL TTC :</Text>
            <Text style={s.grandValue}>{fmt(data.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>{COMPANY.name} — SIRET : {COMPANY.siret} — N° TVA : {COMPANY.vatNumber}</Text>
          <Text style={s.footerText}>{COMPANY.address}, {COMPANY.postalCode} {COMPANY.city} — {COMPANY.email}</Text>
        </View>

      </Page>
    </Document>
  );
}

/**
 * Génère la facture et retourne un Buffer (pour upload R2).
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const logoBase64 = await getLogoPng(); // SVG converti en PNG pour compatibilité @react-pdf/renderer
  const buffer = await renderToBuffer(<InvoiceDoc data={data} logoBase64={logoBase64} />);
  return Buffer.from(buffer);
}