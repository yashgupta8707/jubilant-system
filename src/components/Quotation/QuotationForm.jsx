// client/src/components/Quotation/QuotationForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Form, Button, Card, Table, Row, Col, 
  InputGroup, Badge
} from 'react-bootstrap';
import { quotationService, partyService } from '../../services/api';
import SearchBar from '../ComponentSelector/SearchBar';

const QuotationForm = () => {
  const { id, partyId, reviseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const isReviseMode = Boolean(reviseId);
  
  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState(null);
  const [components, setComponents] = useState([]);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    termsAndConditions: 'Payment terms: 100% advance\nDelivery: Within 7 working days\nWarranty: As per manufacturer',
    status: 'draft'
  });

  // Calculate totals
  const totalAmount = components.reduce((sum, item) => {
    const salesWithGst = Number(item.salesWithGst) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (salesWithGst * quantity);
  }, 0);
  
  const totalPurchase = components.reduce((sum, item) => {
    const purchaseWithGst = Number(item.purchaseWithGst) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (purchaseWithGst * quantity);
  }, 0);
  
  const totalTax = components.reduce((sum, item) => {
    const salesWithGst = Number(item.salesWithGst) || 0;
    const salesWithoutGst = Number(item.salesWithoutGst) || 0;
    const quantity = Number(item.quantity) || 0;
    const tax = (salesWithGst - salesWithoutGst) * quantity;
    return sum + tax;
  }, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          // Edit existing quotation
          const response = await quotationService.getById(id);
          const quote = response.data;
          setParty(quote.party);
          
          // Convert backend data to frontend format
          const formattedComponents = quote.components.map((comp, index) => ({
            tempId: Date.now() + index,
            model: comp.model,
            category: comp.category,
            brand: comp.brand,
            hsn: comp.hsn,
            warranty: comp.warranty,
            quantity: comp.quantity,
            purchaseWithoutGst: Number((comp.purchasePrice / 1.18).toFixed(2)),
            purchaseWithGst: Number(comp.purchasePrice.toFixed(2)),
            salesWithoutGst: Number((comp.salesPrice / 1.18).toFixed(2)),
            salesWithGst: Number(comp.salesPrice.toFixed(2)),
            margin: Number((comp.salesPrice - comp.purchasePrice).toFixed(2))
          }));
          
          setComponents(formattedComponents);
          setFormData({
            notes: quote.notes || '',
            termsAndConditions: quote.termsAndConditions || '',
            status: quote.status
          });
        } else if (isReviseMode) {
          // Create revised version of quotation
          const response = await quotationService.getById(reviseId);
          const quote = response.data;
          setParty(quote.party);
          
          // Convert backend data to frontend format
          const formattedComponents = quote.components.map((comp, index) => ({
            tempId: Date.now() + index,
            model: comp.model,
            category: comp.category,
            brand: comp.brand,
            hsn: comp.hsn,
            warranty: comp.warranty,
            quantity: comp.quantity,
            purchaseWithoutGst: Number((comp.purchasePrice / 1.18).toFixed(2)),
            purchaseWithGst: Number(comp.purchasePrice.toFixed(2)),
            salesWithoutGst: Number((comp.salesPrice / 1.18).toFixed(2)),
            salesWithGst: Number(comp.salesPrice.toFixed(2)),
            margin: Number((comp.salesPrice - comp.purchasePrice).toFixed(2))
          }));
          
          setComponents(formattedComponents);
          setFormData({
            notes: quote.notes || '',
            termsAndConditions: quote.termsAndConditions || '',
            status: 'draft' // New revisions always start as drafts
          });
        } else if (partyId) {
          // Create new quotation for specific party
          const response = await partyService.getById(partyId);
          setParty(response.data);
          setComponents([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, partyId, reviseId, isEditMode, isReviseMode]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddComponent = (model) => {
    const purchaseWithGst = Number(model.purchasePrice) || 0;
    const salesWithGst = Number(model.salesPrice) || 0;
    const purchaseWithoutGst = Number((purchaseWithGst / 1.18).toFixed(2));
    const salesWithoutGst = Number((salesWithGst / 1.18).toFixed(2));

    const newComponent = {
      tempId: Date.now().toString(),
      model,
      category: model.category,
      brand: model.brand,
      hsn: model.hsn,
      warranty: model.warranty,
      quantity: 1,
      purchaseWithoutGst: purchaseWithoutGst,
      purchaseWithGst: purchaseWithGst,
      salesWithoutGst: salesWithoutGst,
      salesWithGst: salesWithGst,
      margin: Number((salesWithoutGst - purchaseWithoutGst).toFixed(2))
    };
    
    setComponents(prev => [...prev, newComponent]);
  };

  const handleComponentChange = (tempId, field, value) => {
    setComponents(prev =>
      prev.map(comp => {
        if (comp.tempId === tempId) {
          const updated = { ...comp };
          
          if (field === 'warranty') {
            // Direct update for warranty (string field)
            updated[field] = value;
          } else if (field === 'quantity') {
            // For quantity, ensure it's at least 1
            const numValue = Number(value) || 1;
            updated[field] = numValue;
          } else {
            // For price fields, handle empty string and convert to number
            const numValue = value === '' ? 0 : Number(value);
            
            if (field === 'purchaseWithoutGst') {
              // Update purchase without GST and auto-calculate with GST
              updated.purchaseWithoutGst = numValue;
              updated.purchaseWithGst = numValue > 0 ? Number((numValue * 1.18).toFixed(2)) : 0;
            } else if (field === 'purchaseWithGst') {
              // Update purchase with GST and auto-calculate without GST
              updated.purchaseWithGst = numValue;
              updated.purchaseWithoutGst = numValue > 0 ? Number((numValue / 1.18).toFixed(2)) : 0;
            } else if (field === 'salesWithoutGst') {
              // Update sales without GST and auto-calculate with GST
              updated.salesWithoutGst = numValue;
              updated.salesWithGst = numValue > 0 ? Number((numValue * 1.18).toFixed(2)) : 0;
            } else if (field === 'salesWithGst') {
              // Update sales with GST and auto-calculate without GST
              updated.salesWithGst = numValue;
              updated.salesWithoutGst = numValue > 0 ? Number((numValue / 1.18).toFixed(2)) : 0;
            }
          }
          
          // Always recalculate margin: Sales(With GST) - Purchase(With GST)
          updated.margin = Number((updated.salesWithoutGst - updated.purchaseWithoutGst).toFixed(2));
          
          return updated;
        }
        return comp;
      })
    );
  };

  const handleRemoveComponent = (tempId) => {
    setComponents(prev => prev.filter(comp => comp.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (components.length === 0) {
      alert('Please add at least one component to the quotation.');
      return;
    }

    try {
      // Format components for backend
      const formattedComponents = components.map(comp => {
        // Remove frontend-only properties
        const { tempId, margin, ...cleanComp } = comp;
        
        return {
          category: typeof cleanComp.category === 'object' ? cleanComp.category._id : cleanComp.category,
          brand: typeof cleanComp.brand === 'object' ? cleanComp.brand._id : cleanComp.brand,
          model: typeof cleanComp.model === 'object' ? cleanComp.model._id : cleanComp.model,
          hsn: cleanComp.hsn,
          warranty: cleanComp.warranty,
          quantity: Number(cleanComp.quantity),
          purchasePrice: Number(cleanComp.purchaseWithGst), // Backend expects purchasePrice
          salesPrice: Number(cleanComp.salesWithGst), // Backend expects salesPrice
          gstRate: 18 // Assuming 18% GST
        };
      });

      const quotationData = {
        party: party._id,
        components: formattedComponents,
        totalAmount: Number(totalAmount),
        totalPurchase: Number(totalPurchase),
        totalTax: Number(totalTax),
        ...formData
      };

      console.log('Sending quotation data:', JSON.stringify(quotationData, null, 2));

      let response;
      
      if (isEditMode) {
        response = await quotationService.update(id, quotationData);
      } else if (isReviseMode) {
        response = await quotationService.revise(reviseId, quotationData);
      } else {
        response = await quotationService.create(quotationData);
      }
      
      navigate(`/quotations/${response.data._id}`);
    } catch (error) {
      console.error('Error saving quotation:', error);
      if (error.response && error.response.data) {
        alert(`Failed to save quotation: ${error.response.data.message}`);
        console.error('Server error:', error.response.data);
      } else {
        alert('Failed to save quotation. Please check your connection.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!party) {
    return (
      <Container className="mt-4">
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Party not found</Card.Title>
            <Button variant="primary" onClick={() => navigate('/parties')}>
              Back to Parties
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-4">
          <Col>
            <h2>
              {isEditMode 
                ? 'Edit Quotation' 
                : isReviseMode 
                  ? 'Create Revised Quotation' 
                  : 'Create New Quotation'}
            </h2>
          </Col>
          <Col className="text-end">
            <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Quotation
            </Button>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Header>
            <h5>Client Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Name:</strong> {party.name}</p>
                <p><strong>Phone:</strong> {party.phone}</p>
              </Col>
              <Col md={6}>
                <p><strong>Email:</strong> {party.email || '-'}</p>
                <p><strong>Address:</strong> {party.address}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5>Components</h5>
          </Card.Header>
          <Card.Body>
            <SearchBar onSelect={handleAddComponent} />

            {components.length > 0 ? (
              <Table responsive striped bordered className="mt-3">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>HSN</th>
                    <th>Warranty</th>
                    <th>Qty</th>
                    <th>Purchase (No GST)</th>
                    <th>Purchase (With GST)</th>
                    <th>Sales (No GST)</th>
                    <th>Sales (With GST)</th>
                    <th>Margin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((component) => (
                    <tr key={component.tempId}>
                      <td>
                        <div><strong>{component.model.name || 'Component'}</strong></div>
                        <div className="text-muted small">
                          {component.category.name} | {component.brand.name}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{component.hsn}</span>
                      </td>
                      <td style={{ width: '120px' }}>
                        <Form.Control
                          type="text"
                          value={component.warranty}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'warranty', 
                            e.target.value
                          )}
                          placeholder="e.g., 1 Year"
                          size="sm"
                        />
                      </td>
                      <td style={{ width: '80px' }}>
                        <Form.Control
                          type="number"
                          min="1"
                          value={component.quantity}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'quantity', 
                            e.target.value
                          )}
                          required
                          size="sm"
                        />
                      </td>
                      <td style={{ width: '120px' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          value={component.purchaseWithoutGst === 0 ? '' : component.purchaseWithoutGst}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'purchaseWithoutGst', 
                            e.target.value
                          )}
                          placeholder="0.00"
                          size="sm"
                        />
                        <small className="text-muted">₹{component.purchaseWithoutGst.toLocaleString()}</small>
                      </td>
                      <td style={{ width: '120px' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          value={component.purchaseWithGst === 0 ? '' : component.purchaseWithGst}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'purchaseWithGst', 
                            e.target.value
                          )}
                          placeholder="0.00"
                          size="sm"
                        />
                        <small className="text-muted">₹{component.purchaseWithGst.toLocaleString()}</small>
                      </td>
                      <td style={{ width: '120px' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          value={component.salesWithoutGst === 0 ? '' : component.salesWithoutGst}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'salesWithoutGst', 
                            e.target.value
                          )}
                          placeholder="0.00"
                          size="sm"
                        />
                        <small className="text-muted">₹{component.salesWithoutGst.toLocaleString()}</small>
                      </td>
                      <td style={{ width: '120px' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          value={component.salesWithGst === 0 ? '' : component.salesWithGst}
                          onChange={(e) => handleComponentChange(
                            component.tempId, 
                            'salesWithGst', 
                            e.target.value
                          )}
                          placeholder="0.00"
                          size="sm"
                        />
                        <small className="text-muted">₹{component.salesWithGst.toLocaleString()}</small>
                      </td>
                      <td>
                        <div className="text-center">
                          <strong className={component.margin >= 0 ? 'text-success' : 'text-danger'}>
                            ₹{component.margin.toLocaleString()}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {component.purchaseWithGst > 0 
                              ? `${((component.margin / component.purchaseWithGst) * 100).toFixed(1)}%` 
                              : '0%'
                            }
                          </small>
                        </div>
                      </td>
                      <td>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRemoveComponent(component.tempId)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-warning">
                    <th colSpan="7" className="text-end">Total Amount:</th>
                    <th colSpan="3" className="text-center">
                      <h5 className="mb-0">₹{Number(totalAmount).toLocaleString()}</h5>
                    </th>
                  </tr>
                </tfoot>
              </Table>
            ) : (
              <div className="text-center mt-3 p-4 bg-light rounded">
                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p className="mb-0">No components added yet. Use the search bar above to add components.</p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5>Additional Information</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Add any special notes or requirements..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="lost">Lost</option>
                <option value="sold">Sold</option>
              </Form.Select>
            </Form.Group>

            <Row className="mt-4">
              <Col md={6}>
                <div className="bg-light p-3 rounded">
                  <h6 className="mb-3">Financial Summary</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Purchase:</span>
                    <strong>₹{Number(totalPurchase).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total GST Amount:</span>
                    <strong>₹{Number(totalTax).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Profit:</span>
                    <strong className={totalAmount - totalPurchase >= 0 ? 'text-success' : 'text-danger'}>
                      ₹{Number(totalAmount - totalPurchase).toLocaleString()}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Profit Margin:</span>
                    <strong className={totalAmount - totalPurchase >= 0 ? 'text-success' : 'text-danger'}>
                      {totalPurchase > 0 
                        ? ((totalAmount - totalPurchase) / totalPurchase * 100).toFixed(2) 
                        : 0}%
                    </strong>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="bg-primary text-white p-3 rounded text-center">
                  <h6 className="mb-2">Total Quotation Amount</h6>
                  <h3 className="mb-0">₹{Number(totalAmount).toLocaleString()}</h3>
                  <small>Including all taxes</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-between mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>
            Cancel
          </Button>
          <Button variant="primary" type="submit" size="lg">
            <i className="fas fa-save me-2"></i>
            {isEditMode ? 'Update Quotation' : 'Save Quotation'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default QuotationForm;