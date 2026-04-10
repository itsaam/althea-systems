import { mkdirSync } from "fs";
import { join } from "path";
import { Document, Page, Text, View, StyleSheet, renderToFile, Link } from "@react-pdf/renderer";
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

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f3f0ff";
const PURPLE_BORDER = "#c4b5fd";
const YELLOW_BG = "#fef3c7";
const YELLOW_BORDER = "#fcd34d";
const RED = "#dc2626";
const GREY_TEXT = "#666";
const GREY_TEXT_DARK = "#444";
const GREY_BORDER = "#e0e0e0";
const GREY_FOOTER_BG = "#f5f5f5";
const GREY_FOOTER_BORDER = "#e0e0e0";
const ROW_ALT = "#f9f9f9";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
    paddingBottom: 60,
  },
  header: {
    backgroundColor: PURPLE,
    color: "white",
    paddingHorizontal: 40,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flexDirection: "column" },
  avoirBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    alignSelf: "flex-start",
    color: "white",
  },
  companyName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "white",
    marginBottom: 6,
  },
  companyInfo: {
    fontSize: 8,
    color: "white",
    opacity: 0.85,
  },
  avoirRef: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  avoirLabel: {
    fontSize: 8,
    color: "white",
    opacity: 0.8,
    marginBottom: 4,
  },
  avoirNumber: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "white",
    marginBottom: 4,
  },
  avoirDate: {
    fontSize: 8,
    color: "white",
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  originInvoice: {
    backgroundColor: PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: PURPLE_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderRadius: 4,
    fontSize: 9,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  originInvoiceText: { fontSize: 9, color: "#333" },
  originInvoiceStrong: { fontSize: 9, color: PURPLE, fontFamily: "Helvetica-Bold" },
  originInvoiceLink: { fontSize: 9, color: PURPLE, textDecoration: "underline" },
  reasonBox: {
    backgroundColor: YELLOW_BG,
    borderWidth: 1,
    borderColor: YELLOW_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
    borderRadius: 4,
    fontSize: 9,
  },
  reasonText: { fontSize: 9, color: "#333" },
  reasonStrong: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },
  boxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  box: {
    borderWidth: 1,
    borderColor: GREY_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "48%",
  },
  boxTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GREY_TEXT,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  boxName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  boxLine: {
    fontSize: 9,
    marginBottom: 2,
    color: GREY_TEXT_DARK,
  },
  boxEmail: {
    fontSize: 8,
    color: GREY_TEXT,
    marginTop: 4,
  },
  boxDetailsValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  boxRefund: {
    fontSize: 9,
    marginTop: 4,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    width: "100%",
    marginBottom: 24,
  },
  tableHeader: {
    backgroundColor: PURPLE,
    flexDirection: "row",
  },
  tableHeaderCell: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "white",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 9,
    color: RED,
  },
  tableCellName: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 9,
    color: "#333",
  },
  colProduct: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colTva: { flex: 1, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  totals: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: 260,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 9,
  },
  totalLabel: { color: GREY_TEXT, fontSize: 9 },
  totalNegative: { color: RED, fontSize: 9 },
  totalGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: PURPLE,
    marginTop: 4,
    paddingTop: 6,
    fontSize: 11,
  },
  totalGrandText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: GREY_FOOTER_BG,
    paddingHorizontal: 40,
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 7,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: GREY_FOOTER_BORDER,
  },
});

function CreditNoteDocument({ data }: { data: CreditNoteData }) {
  const date = new Date(data.createdAt).toLocaleDateString("fr-FR");
  const now = new Date().toLocaleDateString("fr-FR");
  const reasonLabel = REASON_LABELS[data.reason] ?? data.reason;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.avoirBadge}>AVOIR</Text>
            <Text style={styles.companyName}>ALTHEA SYSTEMS</Text>
            <Text style={styles.companyInfo}>123 Rue de la Tech, 75001 Paris</Text>
            <Text style={styles.companyInfo}>
              contact@althea-systems.com | +33 1 23 45 67 89
            </Text>
          </View>
          <View style={styles.avoirRef}>
            <Text style={styles.avoirLabel}>NOTE DE CREDIT</Text>
            <Text style={styles.avoirNumber}>{data.creditNumber}</Text>
            <Text style={styles.avoirDate}>{date}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.originInvoice}>
            <Text style={styles.originInvoiceText}>
              Avoir etabli en reference a la facture{" "}
              <Text style={styles.originInvoiceStrong}>{data.invoiceNumber}</Text>
              {" — Commande "}
              <Text style={styles.originInvoiceStrong}>{data.orderNumber}</Text>
              {"   |   "}
              <Link
                src={`/api/invoices/${data.orderId}/download`}
                style={styles.originInvoiceLink}
              >
                Voir la facture d&apos;origine
              </Link>
            </Text>
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>
              Motif : <Text style={styles.reasonStrong}>{reasonLabel}</Text>
            </Text>
          </View>

          <View style={styles.boxes}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Client</Text>
              <Text style={styles.boxName}>
                {data.address.firstName} {data.address.lastName}
              </Text>
              <Text style={styles.boxLine}>{data.address.street}</Text>
              {data.address.street2 ? (
                <Text style={styles.boxLine}>{data.address.street2}</Text>
              ) : null}
              <Text style={styles.boxLine}>
                {data.address.postalCode} {data.address.city}
              </Text>
              <Text style={styles.boxLine}>{data.address.country}</Text>
              <Text style={styles.boxEmail}>{data.user.email}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Details</Text>
              <Text style={styles.boxLine}>N° commande :</Text>
              <Text style={styles.boxDetailsValue}>{data.orderNumber}</Text>
              <Text style={styles.boxLine}>Date avoir : {date}</Text>
              <Text style={styles.boxRefund}>Remboursement a effectuer</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>Produit</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qte</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix HT</Text>
              <Text style={[styles.tableHeaderCell, styles.colTva]}>TVA</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT</Text>
            </View>
            {data.items.map((item, i) => {
              const totalHT = item.price * item.quantity;
              const tvaLabel = TVA_LABELS[item.tva] ?? item.tva;
              const rowStyle =
                i % 2 === 0
                  ? { ...styles.tableRow, backgroundColor: ROW_ALT }
                  : styles.tableRow;
              return (
                <View key={i} style={rowStyle} wrap={false}>
                  <Text style={[styles.tableCellName, styles.colProduct]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQty]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    -{item.price.toFixed(2)} EUR
                  </Text>
                  <Text style={[styles.tableCell, styles.colTva]}>{tvaLabel}</Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>
                    -{totalHT.toFixed(2)} EUR
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalsBox}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Sous-total HT :</Text>
                <Text style={styles.totalNegative}>
                  -{data.subtotal.toFixed(2)} EUR
                </Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Frais de livraison :</Text>
                <Text style={styles.totalNegative}>
                  -{data.shippingCost.toFixed(2)} EUR
                </Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>TVA :</Text>
                <Text style={styles.totalNegative}>-{data.tax.toFixed(2)} EUR</Text>
              </View>
              <View style={styles.totalGrand}>
                <Text style={styles.totalGrandText}>TOTAL A REMBOURSER :</Text>
                <Text style={styles.totalGrandText}>
                  -{data.total.toFixed(2)} EUR
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Althea Systems SAS - SIRET: 123 456 789 00010 - TVA Intracommunautaire:
            FR12345678900
          </Text>
          <Text>
            Avoir genere le {now} — Ce document annule et remplace la facture{" "}
            {data.invoiceNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCreditNotePDF(data: CreditNoteData): Promise<string> {
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
