// src/components/EstimatePrint.jsx
import React from 'react';

const EstimatePrint = ({ 
  estimateData = {
    estimateNo: 'EPC/E/2526/00210',
    date: '25-04-2025, 12:44 PM',
    placeOfSupply: '09-Uttar Pradesh',
    customer: {
      name: 'Hera Public School(9935877766)',
      address: 'Azamgarh',
      contact: '9935877766',
      state: '09-Uttar Pradesh'
    },
    items: [
      {
        serial: 1,
        category: 'Software',
        brand: 'Microsoft',
        name: 'Windows Genuine License Activation',
        warranty: '1 Year',
        quantity: 1
      },
      {
        serial: 2,
        category: 'Software',
        brand: 'Microsoft',
        name: 'MS Office License',
        warranty: '1 Year',
        quantity: 1
      },
      {
        serial: 3,
        category: 'UPS',
        brand: 'Artis',
        name: 'PS-600VA 600VA Line Interactive',
        warranty: '2 Years',
        quantity: 1
      }
    ],
    totals: {
      quantity: '3',
      amount: '₹ 84,496.80',
      amountInWords: 'Eighty Four Thousand Four Hundred Ninety Six Rupees and Eighty Paisa only',
      finalTotal: '₹ 84,496.80'
    },
    qrCode: '/qr.png' // Your QR code image path
  }
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            .pdf-signature-content {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .pdf-logo-signature {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pdf-logo-signature img {
            width: 30px;
            height: 20px;
          }

          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, sans-serif !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            color: #000 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }

          @page {
            size: A4 !important;
            margin: 8mm 6mm !important;
            orphans: 1 !important;
            widows: 1 !important;
          }

          .print-hide {
            display: none !important;
          }

          .estimate-print-container {
            width: 198mm !important;
            height: 281mm !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10px !important;
            display: block !important;
            page-break-inside: avoid !important;
            position: relative !important;
            overflow: hidden !important;
          }

          /* Watermark */
          .watermark {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-45deg) !important;
            opacity: 0.1 !important;
            z-index: 1 !important;
            pointer-events: none !important;
          }

          .watermark img {
            width: 150mm !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Content over watermark */
          .content-layer {
            position: relative !important;
            z-index: 2 !important;
            background: transparent !important;
          }

          /* Estimate title */
          .pdf-estimate-title {
            text-align: center !important;
            font-size: 20px !important;
            font-weight: bold !important;
            margin: 0 0 6mm 0 !important;
            padding: 0 !important;
            text-decoration: underline !important;
            font-family: Arial, sans-serif !important;
          }

          /* Header table - reduced margins */
          .pdf-header-table {
            width: 100% !important;
            border: 2px solid #000 !important;
            border-collapse: collapse !important;
            margin: 0 0 5mm 0 !important;
            table-layout: fixed !important;
          }

          .pdf-company-cell {
            width: 60% !important;
            padding: 4mm !important;
            vertical-align: top !important;
            border-right: 1px solid #000 !important;
            font-size: 10px !important;
          }

          .pdf-estimate-cell {
            width: 40% !important;
            padding: 4mm !important;
            vertical-align: top !important;
            font-size: 10px !important;
          }

          .pdf-company-flex {
            display: flex !important;
            align-items: flex-start !important;
            gap: 4mm !important;
          }

          .pdf-logo {
            width: 15mm !important;
            height: 15mm !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-company-text h3 {
            font-size: 16px !important;
            font-weight: bold !important;
            margin: 0 0 1mm 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
          }

          .pdf-company-text p {
            font-size: 10px !important;
            margin: 0 0 0.8mm 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
          }

          .pdf-estimate-details {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          .pdf-estimate-details td {
            border: 1px solid #000 !important;
            padding: 2mm 3mm !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            vertical-align: middle !important;
          }

          .pdf-estimate-label {
            background-color: #f0f0f0 !important;
            font-weight: bold !important;
            width: 45% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Customer section */
          .pdf-customer {
            border: 1px solid #000 !important;
            padding: 4mm !important;
            margin: 0 0 5mm 0 !important;
            font-size: 10px !important;
          }

          .pdf-customer h4 {
            font-size: 12px !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            margin: 0 0 2mm 0 !important;
            padding: 0 !important;
          }

          .pdf-customer p {
            font-size: 10px !important;
            margin: 0 0 1mm 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
          }

          /* Simplified items table */
          .pdf-items-table {
            width: 100% !important;
            border: 2px solid #000 !important;
            border-collapse: collapse !important;
            margin: 0 0 5mm 0 !important;
            table-layout: fixed !important;
          }

          .pdf-items-table th {
            background-color: #f0f0f0 !important;
            border: 1px solid #000 !important;
            padding: 3mm 2mm !important;
            text-align: center !important;
            font-weight: bold !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            vertical-align: middle !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-items-table td {
            border: 1px solid #000 !important;
            padding: 2mm !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
            vertical-align: top !important;
            height: 8mm !important;
            overflow: hidden !important;
          }

          /* Simplified column widths */
          .pdf-col-serial { width: 8% !important; text-align: center !important; }
          .pdf-col-category { width: 15% !important; text-align: left !important; }
          .pdf-col-brand { width: 15% !important; text-align: left !important; }
          .pdf-col-item { width: 40% !important; text-align: left !important; }
          .pdf-col-warranty { width: 12% !important; text-align: center !important; }
          .pdf-col-qty { width: 10% !important; text-align: center !important; }

          .pdf-total-row {
            background-color: #f9f9f9 !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Amount in words */
          .pdf-amount-words {
            border: 1px solid #000 !important;
            padding: 4mm !important;
            margin: 0 0 5mm 0 !important;
            font-size: 11px !important;
            font-weight: bold !important;
          }

          /* Bottom section - three columns layout */
          .pdf-bottom-section {
            width: 100% !important;
            margin: 0 0 8mm 0 !important;
            display: table !important;
          }

          /* First column - Bank details with QR */
          .pdf-first-column {
            display: table-cell !important;
            width: 40% !important;
            vertical-align: top !important;
            padding-right: 2mm !important;
          }

          .pdf-bank-details-block {
            border: 1px solid #000 !important;
            padding: 2mm !important;
            font-size: 9px !important;
            height: 30mm !important;
            position: relative !important;
          }

          .pdf-bank-details-block h5 {
            font-size: 11px !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            margin: 0 0 2mm 0 !important;
            padding: 0 !important;
          }

          .pdf-bank-details-block p {
            margin: 0 0 1mm 0 !important;
            padding: 0 !important;
            line-height: 1.3 !important;
          }

          /* QR code inside bank details - bottom right */
          .pdf-qr-in-bank {
            position: absolute !important;
            bottom: 8mm !important;
            right: 3mm !important;
            text-align: center !important;
          }

          .pdf-qr-in-bank img {
            width: 11mm !important;
            height: 11mm !important;
            margin-bottom: 1mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-qr-in-bank p {
            font-size: 5px !important;
            margin: 0 !important;
            font-weight: bold !important;
          }

          /* Second column - Terms */
          .pdf-second-column {
            display: table-cell !important;
            width: 30% !important;
            vertical-align: top !important;
            padding: 0 2mm !important;
          }

          .pdf-terms-block {
            border: 1px solid #000 !important;
            padding: 4mm !important;
            font-size: 9px !important;
            height: 30mm !important;
          }

          .pdf-terms-block h5 {
            font-size: 10px !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            margin: 0 0 2mm 0 !important;
          }

          .pdf-terms-block p {
            margin: 0 !important;
            line-height: 1.3 !important;
          }

          /* Third column - Authorized Signatory */
          .pdf-third-column {
            display: table-cell !important;
            width: 30% !important;
            vertical-align: top !important;
            padding-left: 2mm !important;
          }

          .pdf-signature-block {
            border: 1px solid #000 !important;
            padding: 4mm !important;
            text-align: center !important;
            height: 30mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 2mm !important;
          }

          .pdf-signature-header {
            font-size: 9px !important;
            font-weight: bold !important;
            margin-bottom: 2mm !important;
          }

          .pdf-company-logo-sig {
            display: flex !important;
            align-items: center !important;
            gap: 1mm !important;
            margin-bottom: 3mm !important;
          }

          .pdf-company-logo-sig img {
            width: 14mm !important;
            height: 14mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-company-name-sig {
            font-size: 12px !important;
            font-weight: bold !important;
            color: #000 !important;
          }

          .pdf-signature-line {
            font-size: 8px !important;
            font-weight: bold !important;
            margin-top: auto !important;
          }

          /* Terms and signature - separate section */
          .pdf-footer-terms {
            width: 100% !important;
            display: table !important;
            margin: 5mm 0 0 0 !important;
          }

          .pdf-terms {
            display: table-cell !important;
            width: 50% !important;
            vertical-align: top !important;
            font-size: 9px !important;
            padding-right: 5mm !important;
          }

          .pdf-signature-section {
            display: table-cell !important;
            width: 50% !important;
            vertical-align: top !important;
            text-align: right !important;
            font-size: 10px !important;
          }

          /* Total amount box */
          .pdf-total-amount {
            border: 2px solid #000 !important;
            padding: 4mm !important;
            margin: 0 0 5mm 0 !important;
            text-align: center !important;
            background-color: #f9f9f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-total-amount h3 {
            font-size: 16px !important;
            font-weight: bold !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Terms and signature - remove old footer */

          .pdf-signature-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            gap: 1mm !important;
            margin-bottom: 0 !important;
          }

          .pdf-logo-signature {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 2mm !important;
            margin-bottom: 1mm !important;
          }

          .pdf-logo-signature img {
            width: 10mm !important;
            height: 6mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-signature-box {
            border: 1px solid #000 !important;
            height: 12mm !important;
            width: 35mm !important;
            padding: 2mm !important;
            text-align: center !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
            font-size: 9px !important;
          }

          .pdf-terms h5 {
            font-size: 10px !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            margin: 0 0 1mm 0 !important;
          }

          .pdf-terms p {
            margin: 0 !important;
            line-height: 1.2 !important;
          }

          /* Prevent page breaks */
          .pdf-no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }

        @media screen {
          .estimate-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 900px;
            margin: 20px auto;
            position: relative;
          }
          .print-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .print-btn:hover {
            background: #0056b3;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: 1;
            pointer-events: none;
          }
          .watermark img {
            width: 400px;
            height: auto;
          }
          .content-layer {
            position: relative;
            z-index: 2;
            background: transparent;
          }
        }
      `}</style>

      <div className="container mt-4">
        <button className="print-btn btn btn-primary mb-3 print-hide" onClick={handlePrint}>
          🖨️ Print Estimate
        </button>
        
        <div className="estimate-container">
          {/* Watermark */}
          <div className="watermark">
            <img src="/logo.png" alt="Watermark" />
          </div>

          <div className="estimate-print-container">
            <div className="content-layer">
              
              {/* Estimate Title */}
              <div className="pdf-estimate-title">Estimate</div>
              
              {/* Header Table */}
              <table className="pdf-header-table pdf-no-break">
                <tbody>
                  <tr>
                    <td className="pdf-company-cell">
                      <div className="pdf-company-flex">
                        <img src="/logo.png" alt="Empress PC" className="pdf-logo" />
                        <div className="pdf-company-text">
                          <h3>Empress PC</h3>
                          <p>MS-101, Sector D, Aliganj, Lucknow</p>
                          <p>Phone no.: 8881123430</p>
                          <p>Email: sales@empresspc.in</p>
                          <p>GSTIN: 09AALCD1630P1Z9</p>
                          <p>State: 09-Uttar Pradesh</p>
                        </div>
                      </div>
                    </td>
                    <td className="pdf-estimate-cell">
                      <table className="pdf-estimate-details">
                        <tbody>
                          <tr>
                            <td className="pdf-estimate-label">Estimate No.</td>
                            <td>{estimateData.estimateNo}</td>
                          </tr>
                          <tr>
                            <td className="pdf-estimate-label">Date</td>
                            <td>{estimateData.date}</td>
                          </tr>
                          <tr>
                            <td className="pdf-estimate-label">Place of supply</td>
                            <td>{estimateData.placeOfSupply}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Customer Section */}
              <div className="pdf-customer pdf-no-break">
                <h4>Estimate For</h4>
                <p><strong>{estimateData.customer.name}</strong></p>
                <p>{estimateData.customer.address}</p>
                <p>Contact No.: {estimateData.customer.contact}</p>
                <p>State: {estimateData.customer.state}</p>
              </div>

              {/* Simplified Items Table */}
              <table className="pdf-items-table">
                <thead>
                  <tr>
                    <th className="pdf-col-serial">S.No.</th>
                    <th className="pdf-col-category">Category</th>
                    <th className="pdf-col-brand">Brand</th>
                    <th className="pdf-col-item">Item Name</th>
                    <th className="pdf-col-warranty">Warranty</th>
                    <th className="pdf-col-qty">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="pdf-col-serial">{item.serial}</td>
                      <td className="pdf-col-category">{item.category}</td>
                      <td className="pdf-col-brand">{item.brand}</td>
                      <td className="pdf-col-item">{item.name}</td>
                      <td className="pdf-col-warranty">{item.warranty}</td>
                      <td className="pdf-col-qty">{item.quantity}</td>
                    </tr>
                  ))}
                  

                  
                  <tr className="pdf-total-row">
                    <td className="pdf-col-serial"><strong>Total</strong></td>
                    <td className="pdf-col-category"></td>
                    <td className="pdf-col-brand"></td>
                    <td className="pdf-col-item"></td>
                    <td className="pdf-col-warranty"></td>
                    <td className="pdf-col-qty"><strong>{estimateData.totals.quantity}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Total Amount */}
              <div className="pdf-total-amount pdf-no-break">
                <h3>Total Amount: {estimateData.totals.finalTotal}</h3>
              </div>

              {/* Amount in Words */}
              <div className="pdf-amount-words pdf-no-break">
                <strong>Estimate Amount in Words:</strong><br />
                {estimateData.totals.amountInWords}
              </div>

              {/* Bottom Section - Three Columns */}
              <div className="pdf-bottom-section">
                
                {/* First Column: Bank Details with QR inside */}
                <div className="pdf-first-column">
                  <div className="pdf-bank-details-block">
                    <h5>Bank Details</h5>
                    <p><strong>Name:</strong> KOTAK MAHINDRA BANK LIMITED, LUCKNOW AMINABAD BRANCH</p>
                    <p><strong>Account No.:</strong> 8707304202</p>
                    <p><strong>IFSC code:</strong> KKBK0005194</p>
                    <p><strong>Account holder's name:</strong> DIGINEXT PRO SOLUTIONS PRIVATE LIMITED</p>
                    
                    {/* QR Code inside bank details */}
                    <div className="pdf-qr-in-bank">
                      <img src={estimateData.qrCode || "/qr.png"} alt="QR Code" />
                      <p>Pay</p>
                    </div>
                  </div>
                </div>

                {/* Second Column: Terms and Conditions */}
                <div className="pdf-second-column">
                  <div className="pdf-terms-block">
                    <h5>Terms and conditions</h5>
                    <p>1. Quote Is Valid For 7 Days Only!</p>
                    <p>2. Any advance Received Against An Estimate Is Non Refundable Under Any Circumstances.</p>
                  </div>
                </div>

                {/* Third Column: Authorized Signatory */}
                <div className="pdf-third-column">
                  <div className="pdf-signature-block">
                    <div className="pdf-signature-header">For: Empress PC</div>
                    
                    <div className="pdf-company-logo-sig">
                      <img src="/logo.png" alt="Empress PC Logo" />
                      <div className="pdf-company-name-sig">EMPRESS PC</div>
                    </div>
                    
                    <div className="pdf-signature-line">Authorized Signatory</div>
                  </div>
                </div>
                
              </div>

              {/* Terms and Conditions - Separate Row */}
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EstimatePrint;