import { mkdirSync } from "fs";
import { join } from "path";
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

function buildHtml(data: CreditNoteData): string {
  const itemsHtml = data.items.map((item, i) => {
    const totalHT = item.price * item.quantity;
    const tvaLabel = TVA_LABELS[item.tva] ?? item.tva;
    const bg = i % 2 === 0 ? "#f9f9f9" : "#ffffff";
    return `
      <tr style="background:${bg}">
        <td style="padding:6px 8px">${item.name}</td>
        <td style="padding:6px 8px;text-align:right">${item.quantity}</td>
        <td style="padding:6px 8px;text-align:right">-${item.price.toFixed(2)} EUR</td>
        <td style="padding:6px 8px;text-align:right">${tvaLabel}</td>
        <td style="padding:6px 8px;text-align:right">-${totalHT.toFixed(2)} EUR</td>
      </tr>`;
  }).join("");

  const date = new Date(data.createdAt).toLocaleDateString("fr-FR");
  const now = new Date().toLocaleDateString("fr-FR");
  const reasonLabel = REASON_LABELS[data.reason] ?? data.reason;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:Arial,sans-serif;font-size:11px;color:#333; }
  .header { background:#7c3aed;color:white;padding:24px 40px;display:flex;justify-content:space-between;align-items:flex-start; }
  .company-name { font-size:22px;font-weight:bold;margin-bottom:6px; }
  .company-info { font-size:9px;opacity:0.85; }
  .avoir-badge { background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:4px;font-size:11px;font-weight:bold;margin-bottom:8px;display:inline-block; }
  .avoir-ref { text-align:right; }
  .avoir-label { font-size:9px;opacity:0.8;margin-bottom:4px; }
  .avoir-number { font-size:16px;font-weight:bold;margin-bottom:4px; }
  .avoir-date { font-size:9px;opacity:0.8; }
  .content { padding:24px 40px; }
  .origin-invoice { background:#f3f0ff;border:1px solid #c4b5fd;padding:10px 14px;margin-bottom:20px;border-radius:4px;font-size:10px; }
  .origin-invoice strong { color:#7c3aed; }
  .reason-box { background:#fef3c7;border:1px solid #fcd34d;padding:8px 14px;margin-bottom:20px;border-radius:4px;font-size:10px; }
  .boxes { display:flex;justify-content:space-between;margin-bottom:28px; }
  .box { border:1px solid #e0e0e0;padding:12px 14px;width:48%; }
  .box-title { font-size:8px;font-weight:bold;color:#666;margin-bottom:8px;text-transform:uppercase; }
  .box-name { font-size:12px;font-weight:bold;margin-bottom:4px; }
  .box-line { font-size:10px;margin-bottom:2px;color:#444; }
  table { width:100%;border-collapse:collapse;margin-bottom:24px; }
  thead tr { background:#7c3aed;color:white; }
  thead th { padding:7px 8px;font-size:9px;font-weight:bold; }
  thead th:not(:first-child) { text-align:right; }
  tbody td { font-size:10px;border-bottom:1px solid #f0f0f0;color:#dc2626; }
  tbody td:first-child { color:#333; }
  .totals { display:flex;justify-content:flex-end; }
  .totals-box { width:260px; }
  .total-line { display:flex;justify-content:space-between;padding:4px 0;font-size:10px; }
  .total-line .label { color:#666; }
  .total-line .negative { color:#dc2626; }
  .total-line.grand { border-top:2px solid #7c3aed;margin-top:4px;padding-top:6px;font-weight:bold;font-size:12px;color:#7c3aed; }
  .footer { position:fixed;bottom:0;left:0;right:0;background:#f5f5f5;padding:10px 40px;text-align:center;font-size:8px;color:#888;border-top:1px solid #e0e0e0; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="avoir-badge">AVOIR</div>
    <div class="company-name">ALTHEA SYSTEMS</div>
    <div class="company-info">123 Rue de la Tech, 75001 Paris</div>
    <div class="company-info">contact@althea-systems.com | +33 1 23 45 67 89</div>
  </div>
  <div class="avoir-ref">
    <div class="avoir-label">NOTE DE CREDIT</div>
    <div class="avoir-number">${data.creditNumber}</div>
    <div class="avoir-date">${date}</div>
  </div>
</div>

<div class="content">
  <div class="origin-invoice">
    Avoir etabli en reference a la facture <strong>${data.invoiceNumber}</strong>
    — Commande <strong>${data.orderNumber}</strong>
    &nbsp;|&nbsp;
    <a href="/api/invoices/${data.orderId}/download" style="color:#7c3aed">Voir la facture d'origine</a>
  </div>

  <div class="reason-box">
    Motif : <strong>${reasonLabel}</strong>
  </div>

  <div class="boxes">
    <div class="box">
      <div class="box-title">Client</div>
      <div class="box-name">${data.address.firstName} ${data.address.lastName}</div>
      <div class="box-line">${data.address.street}</div>
      ${data.address.street2 ? `<div class="box-line">${data.address.street2}</div>` : ""}
      <div class="box-line">${data.address.postalCode} ${data.address.city}</div>
      <div class="box-line">${data.address.country}</div>
      <div class="box-line" style="color:#666;font-size:9px;margin-top:4px">${data.user.email}</div>
    </div>
    <div class="box">
      <div class="box-title">Details</div>
      <div class="box-line">N° commande :</div>
      <div class="box-name" style="font-size:11px;margin-bottom:6px">${data.orderNumber}</div>
      <div class="box-line">Date avoir : ${date}</div>
      <div class="box-line" style="margin-top:4px;color:#7c3aed;font-weight:bold">Remboursement a effectuer</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Produit</th>
        <th>Qte</th>
        <th>Prix HT</th>
        <th>TVA</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="total-line"><span class="label">Sous-total HT :</span><span class="negative">-${data.subtotal.toFixed(2)} EUR</span></div>
      <div class="total-line"><span class="label">Frais de livraison :</span><span class="negative">-${data.shippingCost.toFixed(2)} EUR</span></div>
      <div class="total-line"><span class="label">TVA :</span><span class="negative">-${data.tax.toFixed(2)} EUR</span></div>
      <div class="total-line grand"><span>TOTAL A REMBOURSER :</span><span>-${data.total.toFixed(2)} EUR</span></div>
    </div>
  </div>
</div>

<div class="footer">
  Althea Systems SAS - SIRET: 123 456 789 00010 - TVA Intracommunautaire: FR12345678900<br>
  Avoir genere le ${now} — Ce document annule et remplace la facture ${data.invoiceNumber}
</div>
</body>
</html>`;
}

export async function generateCreditNotePDF(data: CreditNoteData): Promise<string> {
  const uploadsDir = join(process.cwd(), "public", "invoices");
  mkdirSync(uploadsDir, { recursive: true });

  const filename = `${data.creditNumber}.pdf`;
  const filepath = join(uploadsDir, filename);
  const publicUrl = `/invoices/${filename}`;

  const html = buildHtml(data);

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: filepath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "60px", left: "0" },
    });
  } finally {
    await browser.close();
  }

  await prisma.creditNote.update({
    where: { id: data.creditNoteId },
    data: { },
  });

  return publicUrl;
}