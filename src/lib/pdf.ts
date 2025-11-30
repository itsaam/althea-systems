// PDF Generation utilities
// You may want to use a library like @react-pdf/renderer or pdfkit

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  // TODO: Implement PDF generation
  // You can use libraries like:
  // - @react-pdf/renderer for React-based PDFs
  // - pdfkit for programmatic PDF creation
  // - puppeteer for HTML to PDF conversion

  const pdfContent = `
    FACTURE ${data.invoiceNumber}
    Date: ${data.date.toLocaleDateString("fr-FR")}
    
    Client: ${data.customer.name}
    ${data.customer.address}
    ${data.customer.postalCode} ${data.customer.city}
    
    Articles:
    ${data.items
      .map(
        (item) => `${item.name} x${item.quantity} - ${item.total.toFixed(2)}€`
      )
      .join("\n")}
    
    Sous-total: ${data.subtotal.toFixed(2)}€
    TVA: ${data.tax.toFixed(2)}€
    Total: ${data.total.toFixed(2)}€
  `;

  return Buffer.from(pdfContent);
}
