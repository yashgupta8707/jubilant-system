// client/src/components/Quotation/QuotationPDFButton.js
import React, { useState } from 'react';
import { Button, Spinner, ButtonGroup, Dropdown } from 'react-bootstrap';
import { generateQuotationPDF, generateQuotationWithPricePDF } from '../../utils/pdfGenerator';

const QuotationPDFButton = ({ quotation, variant = 'primary', size = 'sm' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState('');
  
  const handleDownloadPDF = async (withPrice = false) => {
    try {
      setIsGenerating(true);
      setGeneratingType(withPrice ? 'with-price' : 'regular');
      
      // Validate quotation data first
      if (!quotation || !quotation.party || !quotation.components) {
        alert('Invalid quotation data. Please check the quotation details.');
        return;
      }
      
      // Generate PDF based on type
      const pdf = withPrice 
        ? await generateQuotationWithPricePDF(quotation)
        : await generateQuotationPDF(quotation);
      
      // Create filename
      const partyName = quotation.party.name || 'customer';
      const quotationTitle = quotation.title || 'quotation';
      const priceIndicator = withPrice ? '_with_price' : '';
      const filename = `${quotationTitle}_${partyName.replace(/\s+/g, '_')}${priceIndicator}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };
  
  const handleRegularPDF = () => handleDownloadPDF(false);
  const handlePriceePDF = () => handleDownloadPDF(true);
  
  return (
    <ButtonGroup>
      {/* Main Download PDF Button */}
      <Button 
        variant={variant} 
        size={size}
        onClick={handleRegularPDF}
        disabled={isGenerating}
      >
        {isGenerating && generatingType === 'regular' ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Generating PDF...
          </>
        ) : (
          <>
            <i className="fas fa-file-pdf me-2"></i>
            Download PDF
          </>
        )}
      </Button>
      
      {/* Dropdown for additional options */}
      <Dropdown as={ButtonGroup}>
        <Dropdown.Toggle 
          split 
          variant={variant} 
          size={size}
          disabled={isGenerating}
          id="pdf-download-dropdown"
        />
        
        <Dropdown.Menu>
          <Dropdown.Item 
            onClick={handleRegularPDF}
            disabled={isGenerating}
          >
            <i className="fas fa-file-pdf me-2"></i>
            {isGenerating && generatingType === 'regular' ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Generating PDF...
              </>
            ) : (
              'Download PDF (without prices)'
            )}
          </Dropdown.Item>
          
          <Dropdown.Item 
            onClick={handlePriceePDF}
            disabled={isGenerating}
          >
            <i className="fas fa-file-invoice-dollar me-2"></i>
            {isGenerating && generatingType === 'with-price' ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Generating PDF...
              </>
            ) : (
              'Download with Price'
            )}
          </Dropdown.Item>
          
          <Dropdown.Divider />
          
          <Dropdown.ItemText className="text-muted small">
            <i className="fas fa-info-circle me-2"></i>
            Choose format based on your needs
          </Dropdown.ItemText>
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
};

export default QuotationPDFButton;