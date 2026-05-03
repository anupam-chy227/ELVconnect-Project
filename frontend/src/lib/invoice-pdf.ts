"use client";

import { Invoice } from "@/types";

interface InvoicePDFCalculations {
  subtotal: number;
  globalDiscountAmount: number;
  taxableAmount: number;
  vatAmount: number;
  retentionAmount: number;
  grandTotal: number;
  balanceDue: number;
}

export function calculateInvoiceTotals(invoice: Invoice): InvoicePDFCalculations {
  // Calculate line totals with VAT
  let lineSubtotal = 0;
  invoice.lineItems.forEach((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    const afterDiscount = lineTotal - (item.discount || 0);
    const vat = afterDiscount * ((item.vatRate || 0) / 100);
    lineSubtotal += afterDiscount + vat;
  });

  const subtotal = lineSubtotal;
  const globalDiscountAmount = (subtotal * (invoice.globalDiscount || 0)) / 100;
  const afterGlobalDiscount = subtotal - globalDiscountAmount;
  const taxableAmount = afterGlobalDiscount;

  // VAT on remaining amount
  const vatAmount = 0; // VAT is calculated per line item

  const beforeRetention = taxableAmount + vatAmount;
  const retentionAmount = (beforeRetention * (invoice.retentionPercentage || 0)) / 100;
  const grandTotal = beforeRetention - retentionAmount;
  const totalPaid = invoice.totalPaid || 0;
  const balanceDue = grandTotal - totalPaid;

  return {
    subtotal,
    globalDiscountAmount,
    taxableAmount: afterGlobalDiscount,
    vatAmount,
    retentionAmount,
    grandTotal,
    balanceDue,
  };
}

/**
 * Preload an image and return it as a base64 Data URL.
 * This ensures html2canvas can render the logo reliably without CORS/load timing issues.
 */
function preloadLogoAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        // Fallback to original src if canvas tainting occurs
        resolve(src);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load logo: ${src}`));
    img.src = src;
  });
}

export async function generateInvoicePDF(invoice: Invoice, logoUrl?: string) {
  // Dynamic imports to avoid SSR issues
  const html2canvas = (await import("html2canvas")).default;
  const jsPDF = (await import("jspdf")).jsPDF;

  // Resolve logo URL preference: explicit arg > invoice.from.logo > default
  const rawLogo =
    logoUrl || invoice.from.logo || "/ELVLOGO-HQ.png";

  const resolvedLogo = rawLogo.startsWith("/")
    ? window.location.origin + rawLogo
    : rawLogo;

  // Preload logo so html2canvas can embed it reliably
  let logoDataUrl = "";
  try {
    logoDataUrl = await preloadLogoAsDataURL(resolvedLogo);
  } catch {
    logoDataUrl = resolvedLogo; // fallback
  }

  // Create a temporary container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm";
  container.style.height = "297mm";
  container.style.padding = "20mm";
  container.style.backgroundColor = "white";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.lineHeight = "1.4";

  // Get calculations
  const totals = calculateInvoiceTotals(invoice);

  // Build HTML content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <!-- Header -->
      <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7C3AED; padding-bottom: 15px;">
        <div>
          ${logoDataUrl ? `<img src="${logoDataUrl}" style="height: 50px; margin-bottom: 10px;" crossorigin="anonymous" />` : ""}
          <h1 style="margin: 0; font-size: 24px; color: #7C3AED;">ELV CONNECT</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Professional Invoice System</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0 0 10px 0; font-size: 28px; color: #7C3AED;">${invoice.type.replace(/_/g, " ").toUpperCase()}</h2>
          <p style="margin: 0; font-size: 14px; font-weight: bold;">Invoice #${invoice.invoiceNumber}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <!-- From/To Section -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; gap: 60px;">
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #7C3AED;">FROM:</h3>
          <p style="margin: 0; font-weight: bold;">${invoice.from.name}</p>
          ${invoice.from.companyName ? `<p style="margin: 0;">${invoice.from.companyName}</p>` : ""}
          ${invoice.from.address ? `<p style="margin: 0; font-size: 12px;">${invoice.from.address}</p>` : ""}
          ${invoice.from.email ? `<p style="margin: 0; font-size: 12px;">Email: ${invoice.from.email}</p>` : ""}
          ${invoice.from.phone ? `<p style="margin: 0; font-size: 12px;">Phone: ${invoice.from.phone}</p>` : ""}
          ${invoice.from.trn ? `<p style="margin: 0; font-size: 12px;">TRN: ${invoice.from.trn}</p>` : ""}
        </div>
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #7C3AED;">BILL TO:</h3>
          <p style="margin: 0; font-weight: bold;">${invoice.to.name}</p>
          ${invoice.to.companyName ? `<p style="margin: 0;">${invoice.to.companyName}</p>` : ""}
          ${invoice.to.address ? `<p style="margin: 0; font-size: 12px;">${invoice.to.address}</p>` : ""}
          ${invoice.to.email ? `<p style="margin: 0; font-size: 12px;">Email: ${invoice.to.email}</p>` : ""}
          ${invoice.to.phone ? `<p style="margin: 0; font-size: 12px;">Phone: ${invoice.to.phone}</p>` : ""}
          ${invoice.to.trn ? `<p style="margin: 0; font-size: 12px;">TRN: ${invoice.to.trn}</p>` : ""}
        </div>
      </div>

      <!-- Project Details -->
      <div style="margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 12px;">
        ${
          invoice.projectName
            ? `<div><span style="color: #666;">PROJECT:</span> <strong>${invoice.projectName}</strong></div>`
            : ""
        }
        ${
          invoice.poNumber
            ? `<div><span style="color: #666;">PO NUMBER:</span> <strong>${invoice.poNumber}</strong></div>`
            : ""
        }
        ${
          invoice.siteAddress
            ? `<div><span style="color: #666;">SITE ADDRESS:</span> <strong>${invoice.siteAddress}</strong></div>`
            : ""
        }
      </div>

      <!-- Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
        <thead>
          <tr style="background-color: #7C3AED; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd; width: 60px;">Unit</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd; width: 60px;">Qty</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd; width: 70px;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems
            .map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              return `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.description}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.unit}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${invoice.currency} ${lineTotal.toFixed(2)}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>

      <!-- Totals Section -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 8px 0;">
            <span>Subtotal:</span>
            <span style="font-weight: bold;">${invoice.currency} ${totals.subtotal.toFixed(2)}</span>
          </div>
          ${
            (invoice.globalDiscount || 0) > 0
              ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 8px 0;">
              <span>Global Discount (${invoice.globalDiscount}%):</span>
              <span style="color: #22c55e; font-weight: bold;">-${invoice.currency} ${totals.globalDiscountAmount.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          ${
            invoice.retentionPercentage && invoice.retentionPercentage > 0
              ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 8px 0;">
              <span>Retention (${invoice.retentionPercentage}%):</span>
              <span style="color: #ff6b6b; font-weight: bold;">-${invoice.currency} ${totals.retentionAmount.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding: 12px 0; background-color: #f3f4f6; padding: 10px; margin-top: 10px; border-radius: 4px;">
            <span style="font-weight: bold; font-size: 14px;">Grand Total:</span>
            <span style="font-weight: bold; font-size: 14px; color: #7C3AED;">${invoice.currency} ${totals.grandTotal.toFixed(2)}</span>
          </div>
          ${
            invoice.totalPaid && invoice.totalPaid > 0
              ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #ddd; margin-top: 8px;">
              <span>Amount Paid:</span>
              <span style="color: #22c55e; font-weight: bold;">${invoice.currency} ${invoice.totalPaid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: bold;">
              <span>Balance Due:</span>
              <span style="color: #ff6b6b;">${invoice.currency} ${totals.balanceDue.toFixed(2)}</span>
            </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- Notes Section -->
      ${
        invoice.notes
          ? `
        <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">Notes:</h4>
          <p style="margin: 0; font-size: 11px; white-space: pre-wrap;">${invoice.notes}</p>
        </div>
      `
          : ""
      }

      <!-- Footer -->
      <div style="border-top: 2px solid #7C3AED; padding-top: 15px; text-align: center; font-size: 10px; color: #666;">
        <p style="margin: 0;">Generated by ELV Connect | Professional Invoice Management System</p>
        <p style="margin: 0;">This is a digitally generated invoice</p>
      </div>
    </div>
  `;

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Download
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

