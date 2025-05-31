// client/src/utils/pdfGenerator.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Convert number to words function
const convertNumberToWords = (amount) => {
  try {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (num) => {
      let result = "";
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        result += ones[num] + " ";
      }
      return result;
    };

    let rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);

    let result = "";

    if (rupees >= 10000000) {
      result += convertHundreds(Math.floor(rupees / 10000000)) + "Crore ";
      rupees %= 10000000;
    }
    if (rupees >= 100000) {
      result += convertHundreds(Math.floor(rupees / 100000)) + "Lakh ";
      rupees %= 100000;
    }
    if (rupees >= 1000) {
      result += convertHundreds(Math.floor(rupees / 1000)) + "Thousand ";
      rupees %= 1000;
    }
    if (rupees > 0) {
      result += convertHundreds(rupees);
    }

    result += "Rupees";

    if (paisa > 0) {
      result += " and " + convertHundreds(paisa) + "Paisa";
    }

    return result.trim() + " only";
  } catch (error) {
    console.error("Error converting number to words:", error);
    return `${amount.toFixed(2)} Rupees only`;
  }
};

// Smart watermark selection based on quotation components
const getSmartWatermark = (quotation) => {
  const componentTypes = quotation.components.map((comp) => ({
    category: comp.category?.name?.toLowerCase() || "",
    brand: comp.brand?.name?.toLowerCase() || "",
    name: comp.model?.name?.toLowerCase() || comp.name?.toLowerCase() || "",
  }));

  // Gaming/Graphics focused build
  if (
    componentTypes.some(
      (c) =>
        c.category.includes("graphics") ||
        c.category.includes("gpu") ||
        c.name.includes("rtx") ||
        c.name.includes("gtx") ||
        c.name.includes("gaming")
    )
  ) {
    return {
      primary: "pcie",
      secondary: ["cooler", "case"],
      color: "#00cc88",
    };
  }

  // CPU/Processor focused
  if (
    componentTypes.some(
      (c) =>
        c.category.includes("processor") ||
        c.category.includes("cpu") ||
        c.name.includes("intel") ||
        c.name.includes("amd") ||
        c.name.includes("ryzen") ||
        c.name.includes("core")
    )
  ) {
    return {
      primary: "cpu",
      secondary: ["cooler", "motherboard"],
      color: "#0088ff",
    };
  }

  // Memory/RAM focused
  if (
    componentTypes.some(
      (c) =>
        c.category.includes("memory") ||
        c.category.includes("ram") ||
        c.name.includes("ddr")
    )
  ) {
    return {
      primary: "ram",
      secondary: ["motherboard", "cpu"],
      color: "#ff6600",
    };
  }

  // Storage focused build
  if (
    componentTypes.filter(
      (c) =>
        c.category.includes("storage") ||
        c.category.includes("ssd") ||
        c.category.includes("hdd")
    ).length >= 2
  ) {
    return {
      primary: "hdd",
      secondary: ["motherboard", "cable"],
      color: "#cc6600",
    };
  }

  // Default to motherboard for general PC builds
  return {
    primary: "motherboard",
    secondary: ["cpu", "ram"],
    color: "#ff8c00",
  };
};

// Generate SVG watermark inline
const generateWatermarkSVG = (type) => {
  const svgComponents = {
    ram: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="60" width="120" height="80" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="50" y="70" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="75" y="70" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="100" y="70" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="125" y="70" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="50" y="115" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="75" y="115" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="100" y="115" width="20" height="15" rx="2" fill="currentColor"/>
      <rect x="125" y="115" width="20" height="15" rx="2" fill="currentColor"/>
    </svg>`,

    cpu: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="50" width="100" height="100" rx="8" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="70" y="70" width="60" height="60" rx="4" fill="currentColor" opacity="0.3"/>
      <rect x="80" y="85" width="40" height="8" rx="2" fill="currentColor"/>
      <rect x="80" y="100" width="30" height="6" rx="2" fill="currentColor"/>
      <rect x="80" y="110" width="35" height="6" rx="2" fill="currentColor"/>
    </svg>`,

    pcie: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="70" width="140" height="60" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="45" y="85" width="40" height="30" rx="3" fill="currentColor" opacity="0.4"/>
      <circle cx="120" cy="100" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="120" cy="100" r="15" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="120" cy="100" r="5" fill="currentColor"/>
    </svg>`,

    motherboard: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="40" width="140" height="120" rx="6" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="50" y="60" width="40" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="55" y="65" width="30" height="30" rx="2" fill="currentColor" opacity="0.2"/>
      <rect x="100" y="65" width="60" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="100" y="78" width="60" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    hdd: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="60" width="100" height="80" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="55" y="65" width="90" height="35" rx="2" fill="currentColor" opacity="0.2"/>
      <rect x="55" y="105" width="90" height="30" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="65" y="75" width="50" height="4" rx="1" fill="currentColor"/>
    </svg>`,

    cooler: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="80" width="120" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="70" cy="100" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="100" cy="100" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="130" cy="100" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,

    case: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="30" width="80" height="140" rx="6" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="100" cy="50" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="100" cy="50" r="3" fill="currentColor"/>
      <rect x="70" y="105" width="60" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>`,

    cable: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 100 Q 70 60 100 100 Q 130 140 170 100" fill="none" stroke="currentColor" stroke-width="6"/>
      <rect x="20" y="95" width="20" height="10" rx="3" fill="currentColor"/>
      <rect x="160" y="95" width="20" height="10" rx="3" fill="currentColor"/>
    </svg>`,
  };

  return svgComponents[type] || svgComponents.motherboard;
};

// Create HTML template with smart watermarks (WITHOUT PRICE)
const createEstimateHTML = (quotation) => {
  // Format quotation data
  const estimateData = {
    estimateNo: quotation.title || "EPC/E/2526/00210",
    date: quotation.createdAt
      ? new Date(quotation.createdAt).toLocaleDateString("en-IN") +
        ", " +
        new Date(quotation.createdAt).toLocaleTimeString("en-IN")
      : new Date().toLocaleDateString("en-IN") +
        ", " +
        new Date().toLocaleTimeString("en-IN"),
    placeOfSupply: "09-Uttar Pradesh",
    customer: {
      name: quotation.party.name || "Customer Name",
      address: quotation.party.address || "Customer Address",
      contact: quotation.party.phone || "0000000000",
      state: "09-Uttar Pradesh",
    },
    items: quotation.components.map((comp, index) => ({
      serial: index + 1,
      category: comp.category?.name || "Category",
      brand: comp.brand?.name || "Brand",
      name: comp.model?.name || comp.name || "Component",
      warranty: comp.warranty || "1 Year",
      quantity: comp.quantity || 1,
    })),
    totals: {
      quantity: quotation.components
        .reduce((sum, comp) => sum + (comp.quantity || 1), 0)
        .toString(),
      amount: `₹ ${quotation.totalAmount?.toLocaleString("en-IN") || "0"}`,
      amountInWords: convertNumberToWords(quotation.totalAmount || 0),
      finalTotal: `₹ ${quotation.totalAmount?.toLocaleString("en-IN") || "0"}`,
    },
  };

  // Get smart watermark for this quotation
  const watermarkConfig = getSmartWatermark(quotation);
  const primaryWatermarkSVG = generateWatermarkSVG(watermarkConfig.primary);
  const secondaryWatermark1 = generateWatermarkSVG(
    watermarkConfig.secondary[0]
  );
  const secondaryWatermark2 = generateWatermarkSVG(
    watermarkConfig.secondary[1]
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        html, body {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 8mm 6mm !important;
          font-family: Arial, sans-serif !important;
          font-size: 10px !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .estimate-container {
          width: 100% !important;
          height: 100% !important;
          padding: 3mm !important;
          position: relative !important;
        }

        /* Logo watermark - center position */
        .logo-watermark {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-25%, -25%) rotate(0deg) !important;
          width: 170mm !important;
          height: 170mm !important;
          opacity: 0.1 !important;
          z-index: 1 !important;
          pointer-events: none !important;
        }

        .logo-watermark img {
          width: 100% !important;
          height: 100% !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Component watermarks */
        .watermark {
          position: absolute !important;
          opacity: 0.06 !important;
          z-index: 1 !important;
          pointer-events: none !important;
          color: ${watermarkConfig.color} !important;
        }

        .watermark-1 {
          top: 25% !important;
          left: 20% !important;
          transform: translate(-50%, -50%) rotate(-35deg) !important;
          width: 80mm !important;
          height: 80mm !important;
        }

        .watermark-2 {
          top: 75% !important;
          left: 80% !important;
          transform: translate(-50%, -50%) rotate(25deg) !important;
          width: 60mm !important;
          height: 60mm !important;
          opacity: 0.06 !important;
        }

        .watermark-3 {
          top: 40% !important;
          left: 80% !important;
          transform: translate(-50%, -50%) rotate(-65deg) !important;
          width: 50mm !important;
          height: 50mm !important;
          opacity: 0.06 !important;
        }

        .watermark svg {
          width: 100% !important;
          height: 100% !important;
        }

        .content {
          position: relative !important;
          z-index: 2 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Title */
        .estimate-title {
          text-align: center !important;
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 4mm !important;
          text-decoration: underline !important;
        }

        /* Header section */
        .header-section {
          border: 2px solid #000 !important;
          margin-bottom: 3mm !important;
          display: table !important;
          width: 100% !important;
        }

        .header-row {
          display: table-row !important;
        }

        .company-cell {
          display: table-cell !important;
          width: 60% !important;
          padding: 3mm !important;
          vertical-align: top !important;
          border-right: 1px solid #000 !important;
        }

        .estimate-cell {
          display: table-cell !important;
          width: 40% !important;
          padding: 3mm !important;
          vertical-align: top !important;
        }

        .company-info {
          display: flex !important;
          align-items: flex-start !important;
          gap: 3mm !important;
        }

        .company-logo {
          width: 12mm !important;
          height: 12mm !important;
          flex-shrink: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .company-details h3 {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-bottom: 1mm !important;
        }

        .company-details p {
          font-size: 9px !important;
          margin-bottom: 0.5mm !important;
          line-height: 1.2 !important;
        }

        .estimate-info table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        .estimate-info td {
          border: 1px solid #000 !important;
          padding: 2mm !important;
          font-size: 9px !important;
          vertical-align: middle !important;
        }

        .estimate-label {
          background-color: #f0f0f0 !important;
          font-weight: bold !important;
          width: 45% !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Customer section */
        .customer-section {
          border: 1px solid #000 !important;
          padding: 3mm !important;
          margin-bottom: 3mm !important;
        }

        .customer-section h4 {
          font-size: 10px !important;
          font-weight: bold !important;
          text-decoration: underline !important;
          margin-bottom: 2mm !important;
        }

        .customer-section p {
          font-size: 9px !important;
          margin-bottom: 1mm !important;
          line-height: 1.2 !important;
        }

        /* Items table */
        .items-table {
          width: 100% !important;
          border: 2px solid #000 !important;
          border-collapse: collapse !important;
          margin-bottom: 3mm !important;
        }

        .items-table th {
          background-color: #f0f0f0 !important;
          border: 1px solid #000 !important;
          padding: 2mm !important;
          text-align: center !important;
          font-weight: bold !important;
          font-size: 9px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .items-table td {
          border: 1px solid #000 !important;
          padding: 2mm !important;
          font-size: 8px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }

        .items-table .text-left {
          text-align: left !important;
        }

        .total-row {
          font-weight: bold !important;
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Combined total amount section */
        .total-amount-section {
          border: 2px solid #000 !important;
          margin-bottom: 3mm !important;
          display: table !important;
          width: 100% !important;
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .total-amount-row {
          display: table-row !important;
        }

        .amount-words-cell {
          display: table-cell !important;
          width: 70% !important;
          padding: 4mm !important;
          vertical-align: middle !important;
          border-right: 1px solid #000 !important;
        }

        .total-amount-cell {
          display: table-cell !important;
          width: 30% !important;
          padding: 4mm !important;
          vertical-align: middle !important;
          text-align: center !important;
        }

        .amount-words-label {
          font-size: 10px !important;
          font-weight: bold !important;
          margin-bottom: 2mm !important;
        }

        .amount-words-text {
          font-size: 9px !important;
          font-weight: bold !important;
          line-height: 1.3 !important;
        }

        .total-amount-value {
          font-size: 16px !important;
          font-weight: bold !important;
          margin: 0 !important;
        }

        /* Bottom section - three columns */
        .bottom-section {
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;
        }

        .bottom-column {
          display: table-cell !important;
          vertical-align: top !important;
          border: 1px solid #000 !important;
          padding: 3mm !important;
          position: relative !important;
        }

        .bank-column {
          width: 40% !important;
        }

        .terms-column {
          width: 30% !important;
        }

        .signature-column {
          width: 30% !important;
          text-align: center !important;
        }

        .bottom-section h5 {
          font-size: 10px !important;
          font-weight: bold !important;
          text-decoration: underline !important;
          margin-bottom: 2mm !important;
        }

        .bottom-section p {
          font-size: 8px !important;
          margin-bottom: 1mm !important;
          line-height: 1.2 !important;
        }

        /* QR code in bank details */
        .qr-code {
          position: absolute !important;
          bottom: 3mm !important;
          right: 3mm !important;
          text-align: center !important;
        }

        .qr-code img {
          width: 8mm !important;
          height: 8mm !important;
          margin-bottom: 1mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .qr-code p {
          font-size: 6px !important;
          margin: 0 !important;
          font-weight: bold !important;
        }

        /* Signature section */
        .signature-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          gap: 2mm !important;
        }

        .company-logo-sig {
          display: flex !important;
          align-items: center !important;
          gap: 2mm !important;
        }

        .company-logo-sig img {
          width: 8mm !important;
          height: 6mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .company-name {
          font-size: 11px !important;
          font-weight: bold !important;
        }

        .signature-line {
          font-size: 8px !important;
          font-weight: bold !important;
        }
      </style>
    </head>
    <body>
      <div class="estimate-container">
        <!-- Logo Watermark - Center -->
        <div class="logo-watermark">
          <img src="/logo.png" alt="Company Logo Watermark" />
        </div>

        <!-- Smart Component Watermarks -->
        <div class="watermark watermark-1">
          ${primaryWatermarkSVG}
        </div>
        <div class="watermark watermark-2">
          ${secondaryWatermark1}
        </div>
        <div class="watermark watermark-3">
          ${secondaryWatermark2}
        </div>

        <div class="content">
          <!-- Title -->
          <div class="estimate-title">Estimate</div>
          
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-row">
              <div class="company-cell">
                <div class="company-info">
                  <img src="/logo.png" alt="Empress PC" class="company-logo" />
                  <div class="company-details">
                    <h3>Empress PC</h3>
                    <p>MS-101, Sector D, Aliganj, Lucknow</p>
                    <p>Phone no.: 8881123430</p>
                    <p>Email: sales@empresspc.in</p>
                    <p>GSTIN: 09AALCD1630P1Z9</p>
                    <p>State: 09-Uttar Pradesh</p>
                  </div>
                </div>
              </div>
              <div class="estimate-cell">
                <div class="estimate-info">
                  <table>
                    <tbody>
                      <tr>
                        <td class="estimate-label">Estimate No.</td>
                        <td>${estimateData.estimateNo}</td>
                      </tr>
                      <tr>
                        <td class="estimate-label">Date</td>
                        <td>${estimateData.date}</td>
                      </tr>
                      <tr>
                        <td class="estimate-label">Place of supply</td>
                        <td>${estimateData.placeOfSupply}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Section -->
          <div class="customer-section">
            <h4>Estimate For</h4>
            <p><strong>${estimateData.customer.name}</strong></p>
            <p>${estimateData.customer.address}</p>
            <p>Contact No.: ${estimateData.customer.contact}</p>
            <p>State: ${estimateData.customer.state}</p>
          </div>

          <!-- Items Table WITHOUT PRICE -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%;">S.No.</th>
                <th style="width: 15%;">Category</th>
                <th style="width: 15%;">Brand</th>
                <th style="width: 40%;">Item Name</th>
                <th style="width: 12%;">Warranty</th>
                <th style="width: 10%;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${estimateData.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.serial}</td>
                  <td class="text-left">${item.category}</td>
                  <td class="text-left">${item.brand}</td>
                  <td class="text-left">${item.name}</td>
                  <td>${item.warranty}</td>
                  <td>${item.quantity}</td>
                </tr>
              `
                )
                .join("")}
              
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong>${estimateData.totals.quantity}</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Combined Total Amount Section -->
          <div class="total-amount-section">
            <div class="total-amount-row">
              <div class="amount-words-cell">
                <div class="amount-words-label">Estimate Amount in Words:</div>
                <div class="amount-words-text">${estimateData.totals.amountInWords}</div>
              </div>
              <div class="total-amount-cell">
                <h3 class="total-amount-value">Total Amount:<br />${estimateData.totals.finalTotal}</h3>
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="bottom-section">
            <!-- Bank Details -->
            <div class="bottom-column bank-column">
              <h5>Bank Details</h5>
              <p><strong>Name:</strong> KOTAK MAHINDRA BANK LIMITED, LUCKNOW AMINABAD BRANCH</p>
              <p><strong>Account No.:</strong> 8707304202</p>
              <p><strong>IFSC code:</strong> KKBK0005194</p>
              <p><strong>Account holder's name:</strong> DIGINEXT PRO SOLUTIONS PRIVATE LIMITED</p>
              
              <!-- QR Code -->
              <div class="qr-code">
                <img src="/qr.png" alt="QR Code" />
                <p>Pay</p>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="bottom-column terms-column">
              <h5>Terms and conditions</h5>
              <p>1. Quote Is Valid For 7 Days Only!</p>
            </div>

            <!-- Authorized Signatory -->
            <div class="bottom-column signature-column">
              <div class="signature-content">
                <p style="font-size: 9px; font-weight: bold; margin-bottom: 2mm;">For: Empress PC</p>
                
                <div class="company-logo-sig">
                  <img src="/logo.png" alt="Empress PC" />
                  <div class="company-name">EMPRESS PC</div>
                </div>
                
                <div class="signature-line">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create HTML template WITH PRICE (NEW FUNCTION)
const createEstimateWithPriceHTML = (quotation) => {
  // Format quotation data with prices
  const estimateData = {
    estimateNo: quotation.title || "EPC/E/2526/00210",
    date: quotation.createdAt
      ? new Date(quotation.createdAt).toLocaleDateString("en-IN") +
        ", " +
        new Date(quotation.createdAt).toLocaleTimeString("en-IN")
      : new Date().toLocaleDateString("en-IN") +
        ", " +
        new Date().toLocaleTimeString("en-IN"),
    placeOfSupply: "09-Uttar Pradesh",
    customer: {
      name: quotation.party.name || "Customer Name",
      address: quotation.party.address || "Customer Address",
      contact: quotation.party.phone || "0000000000",
      state: "09-Uttar Pradesh",
    },
    items: quotation.components.map((comp, index) => ({
      serial: index + 1,
      brand: comp.brand?.name || "Brand",
      category: comp.category?.name || "Category",
      name: comp.model?.name || comp.name || "Component",
      warranty: comp.warranty || "1 Year",
      quantity: comp.quantity || 1,
      price: comp.salesPrice || 0,
      totalPrice: (comp.salesPrice || 0) * (comp.quantity || 1),
    })),
    totals: {
      quantity: quotation.components
        .reduce((sum, comp) => sum + (comp.quantity || 1), 0)
        .toString(),
      amount: `₹ ${quotation.totalAmount?.toLocaleString("en-IN") || "0"}`,
      amountInWords: convertNumberToWords(quotation.totalAmount || 0),
      finalTotal: `₹ ${quotation.totalAmount?.toLocaleString("en-IN") || "0"}`,
    },
  };

  // Get smart watermark for this quotation
  const watermarkConfig = getSmartWatermark(quotation);
  const primaryWatermarkSVG = generateWatermarkSVG(watermarkConfig.primary);
  const secondaryWatermark1 = generateWatermarkSVG(
    watermarkConfig.secondary[0]
  );
  const secondaryWatermark2 = generateWatermarkSVG(
    watermarkConfig.secondary[1]
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        html, body {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 8mm 6mm !important;
          font-family: Arial, sans-serif !important;
          font-size: 10px !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .estimate-container {
          width: 100% !important;
          height: 100% !important;
          padding: 3mm !important;
          position: relative !important;
        }

        /* Logo watermark - center position */
        .logo-watermark {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-25%, -25%) rotate(0deg) !important;
          width: 170mm !important;
          height: 170mm !important;
          opacity: 0.1 !important;
          z-index: 1 !important;
          pointer-events: none !important;
        }

        .logo-watermark img {
          width: 100% !important;
          height: 100% !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Component watermarks */
        .watermark {
          position: absolute !important;
          opacity: 0.06 !important;
          z-index: 1 !important;
          pointer-events: none !important;
          color: ${watermarkConfig.color} !important;
        }

        .watermark-1 {
          top: 25% !important;
          left: 20% !important;
          transform: translate(-50%, -50%) rotate(-35deg) !important;
          width: 80mm !important;
          height: 80mm !important;
        }

        .watermark-2 {
          top: 75% !important;
          left: 80% !important;
          transform: translate(-50%, -50%) rotate(25deg) !important;
          width: 60mm !important;
          height: 60mm !important;
          opacity: 0.06 !important;
        }

        .watermark-3 {
          top: 40% !important;
          left: 80% !important;
          transform: translate(-50%, -50%) rotate(-65deg) !important;
          width: 50mm !important;
          height: 50mm !important;
          opacity: 0.06 !important;
        }

        .watermark svg {
          width: 100% !important;
          height: 100% !important;
        }

        .content {
          position: relative !important;
          z-index: 2 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Title */
        .estimate-title {
          text-align: center !important;
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 4mm !important;
          text-decoration: underline !important;
        }

        /* Header section */
        .header-section {
          border: 2px solid #000 !important;
          margin-bottom: 3mm !important;
          display: table !important;
          width: 100% !important;
        }

        .header-row {
          display: table-row !important;
        }

        .company-cell {
          display: table-cell !important;
          width: 60% !important;
          padding: 3mm !important;
          vertical-align: top !important;
          border-right: 1px solid #000 !important;
        }

        .estimate-cell {
          display: table-cell !important;
          width: 40% !important;
          padding: 3mm !important;
          vertical-align: top !important;
        }

        .company-info {
          display: flex !important;
          align-items: flex-start !important;
          gap: 3mm !important;
        }

        .company-logo {
          width: 12mm !important;
          height: 12mm !important;
          flex-shrink: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .company-details h3 {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-bottom: 1mm !important;
        }

        .company-details p {
          font-size: 9px !important;
          margin-bottom: 0.5mm !important;
          line-height: 1.2 !important;
        }

        .estimate-info table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        .estimate-info td {
          border: 1px solid #000 !important;
          padding: 2mm !important;
          font-size: 9px !important;
          vertical-align: middle !important;
        }

        .estimate-label {
          background-color: #f0f0f0 !important;
          font-weight: bold !important;
          width: 45% !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Customer section */
        .customer-section {
          border: 1px solid #000 !important;
          padding: 3mm !important;
          margin-bottom: 3mm !important;
        }

        .customer-section h4 {
          font-size: 10px !important;
          font-weight: bold !important;
          text-decoration: underline !important;
          margin-bottom: 2mm !important;
        }

        .customer-section p {
          font-size: 9px !important;
          margin-bottom: 1mm !important;
          line-height: 1.2 !important;
        }

        /* Items table WITH PRICE */
        .items-table {
          width: 100% !important;
          border: 2px solid #000 !important;
          border-collapse: collapse !important;
          margin-bottom: 3mm !important;
        }

        .items-table th {
          background-color: #f0f0f0 !important;
          border: 1px solid #000 !important;
          padding: 2mm !important;
          text-align: center !important;
          font-weight: bold !important;
          font-size: 9px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .items-table td {
          border: 1px solid #000 !important;
          padding: 2mm !important;
          font-size: 8px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }

        .items-table .text-left {
          text-align: left !important;
        }

        .items-table .text-right {
          text-align: right !important;
        }

        .total-row {
          font-weight: bold !important;
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Combined total amount section */
        .total-amount-section {
          border: 2px solid #000 !important;
          margin-bottom: 3mm !important;
          display: table !important;
          width: 100% !important;
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .total-amount-row {
          display: table-row !important;
        }

        .amount-words-cell {
          display: table-cell !important;
          width: 70% !important;
          padding: 4mm !important;
          vertical-align: middle !important;
          border-right: 1px solid #000 !important;
        }

        .total-amount-cell {
          display: table-cell !important;
          width: 30% !important;
          padding: 4mm !important;
          vertical-align: middle !important;
          text-align: center !important;
        }

        .amount-words-label {
          font-size: 10px !important;
          font-weight: bold !important;
          margin-bottom: 2mm !important;
        }

        .amount-words-text {
          font-size: 9px !important;
          font-weight: bold !important;
          line-height: 1.3 !important;
        }

        .total-amount-value {
          font-size: 16px !important;
          font-weight: bold !important;
          margin: 0 !important;
        }

        /* Bottom section - three columns */
        .bottom-section {
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;
        }

        .bottom-column {
          display: table-cell !important;
          vertical-align: top !important;
          border: 1px solid #000 !important;
          padding: 3mm !important;
          position: relative !important;
        }

        .bank-column {
          width: 40% !important;
        }

        .terms-column {
          width: 30% !important;
        }

        .signature-column {
          width: 30% !important;
          text-align: center !important;
        }

        .bottom-section h5 {
          font-size: 10px !important;
          font-weight: bold !important;
          text-decoration: underline !important;
          margin-bottom: 2mm !important;
        }

        .bottom-section p {
          font-size: 8px !important;
          margin-bottom: 1mm !important;
          line-height: 1.2 !important;
        }

        /* QR code in bank details */
        .qr-code {
          position: absolute !important;
          bottom: 3mm !important;
          right: 3mm !important;
          text-align: center !important;
        }

        .qr-code img {
          width: 8mm !important;
          height: 8mm !important;
          margin-bottom: 1mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .qr-code p {
          font-size: 6px !important;
          margin: 0 !important;
          font-weight: bold !important;
        }

        /* Signature section */
        .signature-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          gap: 2mm !important;
        }

        .company-logo-sig {
          display: flex !important;
          align-items: center !important;
          gap: 2mm !important;
        }

        .company-logo-sig img {
          width: 8mm !important;
          height: 6mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .company-name {
          font-size: 11px !important;
          font-weight: bold !important;
        }

        .signature-line {
          font-size: 8px !important;
          font-weight: bold !important;
        }
      </style>
    </head>
    <body>
      <div class="estimate-container">
        <!-- Logo Watermark - Center -->
        <div class="logo-watermark">
          <img src="/logo.png" alt="Company Logo Watermark" />
        </div>

        <!-- Smart Component Watermarks -->
        <div class="watermark watermark-1">
          ${primaryWatermarkSVG}
        </div>
        <div class="watermark watermark-2">
          ${secondaryWatermark1}
        </div>
        <div class="watermark watermark-3">
          ${secondaryWatermark2}
        </div>

        <div class="content">
          <!-- Title -->
          <div class="estimate-title">Estimate</div>
          
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-row">
              <div class="company-cell">
                <div class="company-info">
                  <img src="/logo.png" alt="Empress PC" class="company-logo" />
                  <div class="company-details">
                    <h3>Empress PC</h3>
                    <p>MS-101, Sector D, Aliganj, Lucknow</p>
                    <p>Phone no.: 8881123430</p>
                    <p>Email: sales@empresspc.in</p>
                    <p>GSTIN: 09AALCD1630P1Z9</p>
                    <p>State: 09-Uttar Pradesh</p>
                  </div>
                </div>
              </div>
              <div class="estimate-cell">
                <div class="estimate-info">
                  <table>
                    <tbody>
                      <tr>
                        <td class="estimate-label">Estimate No.</td>
                        <td>${estimateData.estimateNo}</td>
                      </tr>
                      <tr>
                        <td class="estimate-label">Date</td>
                        <td>${estimateData.date}</td>
                      </tr>
                      <tr>
                        <td class="estimate-label">Place of supply</td>
                        <td>${estimateData.placeOfSupply}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Section -->
          <div class="customer-section">
            <h4>Estimate For</h4>
            <p><strong>${estimateData.customer.name}</strong></p>
            <p>${estimateData.customer.address}</p>
            <p>Contact No.: ${estimateData.customer.contact}</p>
            <p>State: ${estimateData.customer.state}</p>
          </div>

          <!-- Items Table WITH PRICE -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 6%;">S.No.</th>
                <th style="width: 12%;">Brand</th>
                <th style="width: 12%;">Category</th>
                <th style="width: 32%;">Item Name</th>
                <th style="width: 10%;">Warranty</th>
                <th style="width: 8%;">Qty</th>
                <th style="width: 20%;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${estimateData.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.serial}</td>
                  <td class="text-left">${item.brand}</td>
                  <td class="text-left">${item.category}</td>
                  <td class="text-left">${item.name}</td>
                  <td>${item.warranty}</td>
                  <td>${item.quantity}</td>
                  <td class="text-right">₹ ${item.totalPrice.toLocaleString("en-IN")}</td>
                </tr>
              `
                )
                .join("")}
              
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong>${estimateData.totals.quantity}</strong></td>
                <td class="text-right"><strong>${estimateData.totals.amount}</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Combined Total Amount Section -->
          <div class="total-amount-section">
            <div class="total-amount-row">
              <div class="amount-words-cell">
                <div class="amount-words-label">Estimate Amount in Words:</div>
                <div class="amount-words-text">${estimateData.totals.amountInWords}</div>
              </div>
              <div class="total-amount-cell">
                <h3 class="total-amount-value">Total Amount:<br />${estimateData.totals.finalTotal}</h3>
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="bottom-section">
            <!-- Bank Details -->
            <div class="bottom-column bank-column">
              <h5>Bank Details</h5>
              <p><strong>Name:</strong> KOTAK MAHINDRA BANK LIMITED, LUCKNOW AMINABAD BRANCH</p>
              <p><strong>Account No.:</strong> 8707304202</p>
              <p><strong>IFSC code:</strong> KKBK0005194</p>
              <p><strong>Account holder's name:</strong> DIGINEXT PRO SOLUTIONS PRIVATE LIMITED</p>
              
              <!-- QR Code -->
              <div class="qr-code">
                <img src="/qr.png" alt="QR Code" />
                <p>Pay</p>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="bottom-column terms-column">
              <h5>Terms and conditions</h5>
              <p>1. Quote Is Valid For 7 Days Only!</p>
            </div>

            <!-- Authorized Signatory -->
            <div class="bottom-column signature-column">
              <div class="signature-content">
                <p style="font-size: 9px; font-weight: bold; margin-bottom: 2mm;">For: Empress PC</p>
                
                <div class="company-logo-sig">
                  <img src="/logo.png" alt="Empress PC" />
                  <div class="company-name">EMPRESS PC</div>
                </div>
                
                <div class="signature-line">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Updated PDF generation function (WITHOUT PRICE)
export const generateQuotationPDF = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate quotation data
      if (!quotation || !quotation.party || !quotation.components) {
        throw new Error("Invalid quotation data");
      }

      // Create HTML content with smart watermarks (WITHOUT PRICE)
      const htmlContent = createEstimateHTML(quotation);
      let tempDiv = document.createElement("div");

      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "210mm";
      tempDiv.style.height = "297mm";

      document.body.appendChild(tempDiv);

      // Configure html2canvas options for high quality
      const options = {
        allowTaint: true,
        backgroundColor: "#ffffff",
        canvas: null,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        logging: false,
        proxy: null,
        removeContainer: true,
        scale: 2, // Higher scale for better quality
        useCORS: true,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0,
      };

      // Convert HTML to canvas
      html2canvas(tempDiv.querySelector(".estimate-container"), options)
        .then((canvas) => {
          // Clean up temporary div
          document.body.removeChild(tempDiv);

          // Create PDF
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            putOnlyUsedFonts: true,
            floatPrecision: 16,
          });

          // Calculate dimensions to fit A4
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add image to PDF
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

          resolve(pdf);
        })
        .catch((error) => {
          // Clean up on error
          if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
          }
          console.error("Error converting HTML to canvas:", error);
          reject(new Error(`PDF generation failed: ${error.message}`));
        });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error(`PDF generation failed: ${error.message}`));
    }
  });
};

// NEW PDF generation function (WITH PRICE)
export const generateQuotationWithPricePDF = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate quotation data
      if (!quotation || !quotation.party || !quotation.components) {
        throw new Error("Invalid quotation data");
      }

      // Create HTML content with smart watermarks (WITH PRICE)
      const htmlContent = createEstimateWithPriceHTML(quotation);
      let tempDiv = document.createElement("div");

      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "210mm";
      tempDiv.style.height = "297mm";

      document.body.appendChild(tempDiv);

      // Configure html2canvas options for high quality
      const options = {
        allowTaint: true,
        backgroundColor: "#ffffff",
        canvas: null,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        logging: false,
        proxy: null,
        removeContainer: true,
        scale: 2, // Higher scale for better quality
        useCORS: true,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0,
      };

      // Convert HTML to canvas
      html2canvas(tempDiv.querySelector(".estimate-container"), options)
        .then((canvas) => {
          // Clean up temporary div
          document.body.removeChild(tempDiv);

          // Create PDF
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            putOnlyUsedFonts: true,
            floatPrecision: 16,
          });

          // Calculate dimensions to fit A4
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add image to PDF
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

          resolve(pdf);
        })
        .catch((error) => {
          // Clean up on error
          if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
          }
          console.error("Error converting HTML to canvas:", error);
          reject(new Error(`PDF generation failed: ${error.message}`));
        });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error(`PDF generation failed: ${error.message}`));
    }
  });
};

// Keep existing helper functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const validateQuotationData = (quotation) => {
  if (!quotation) {
    throw new Error("Quotation data is required");
  }
  if (!quotation.party) {
    throw new Error("Party information is required");
  }
  if (!quotation.components || quotation.components.length === 0) {
    throw new Error("At least one component is required");
  }
  if (!quotation.totalAmount || quotation.totalAmount <= 0) {
    throw new Error("Valid total amount is required");
  }
  return true;
};