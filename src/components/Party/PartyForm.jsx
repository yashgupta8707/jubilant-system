// client/src/components/Party/PartyForm.js - Fixed API usage
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Form, 
  Button, 
  Row, 
  Col, 
  Card, 
  Badge,
  InputGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import { partyService } from '../../services/api';

const PartyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    source: 'walk-in',
    priority: 'medium',
    requirements: '',
    dealStatus: 'in_progress',
    tags: [],
    initialComment: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchParty = async () => {
        try {
          const response = await partyService.getById(id);
          const party = response.data;
          setFormData({
            name: party.name || '',
            phone: party.phone || '',
            address: party.address || '',
            email: party.email || '',
            source: party.source || 'walk-in',
            priority: party.priority || 'medium',
            requirements: party.requirements || '',
            dealStatus: party.dealStatus || 'in_progress',
            tags: party.tags || [],
            initialComment: ''
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching party:', error);
          setError('Failed to load client data');
          setLoading(false);
        }
      };

      fetchParty();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      console.log('🚀 Submitting form data:', formData);
      
      if (isEditMode) {
        console.log('📝 Updating existing party...');
        await partyService.update(id, {
          ...formData,
          changeComment: formData.initialComment || undefined
        });
        console.log('✅ Party updated successfully');
      } else {
        console.log('🆕 Creating new party...');
        
        // Prepare clean data for creation
        const cleanFormData = {
          name: formData.name?.trim(),
          phone: formData.phone?.trim(),
          address: formData.address?.trim(),
          email: formData.email?.trim() || undefined,
          source: formData.source || 'walk-in',
          priority: formData.priority || 'medium',
          requirements: formData.requirements?.trim() || '',
          dealStatus: formData.dealStatus || 'in_progress',
          tags: formData.tags || [],
          initialComment: formData.initialComment?.trim() || undefined
        };
        
        console.log('📤 Sending cleaned data:', cleanFormData);
        
        const response = await partyService.create(cleanFormData);
        console.log('✅ Party created successfully:', response.data);
      }
      
      navigate('/parties');
      
    } catch (error) {
      console.error('❌ Error saving party:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extract meaningful error message
      let errorMessage = 'Failed to save client. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map(err => `${err.field}: ${err.message}`).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityIcon = (priority) => {
    const icons = { low: '🟢', medium: '🟡', high: '🔴' };
    return icons[priority] || '⚪';
  };

  const getSourceIcon = (source) => {
    const icons = {
      instagram: '📷',
      linkedin: '💼',
      whatsapp: '📱',
      'walk-in': '🚶',
      referral: '👥',
      website: '🌐',
      other: '📌'
    };
    return icons[source] || '📌';
  };

  const getDealStatusIcon = (status) => {
    const icons = {
      in_progress: '⏳',
      won: '🎉',
      lost: '❌',
      on_hold: '⏸️'
    };
    return icons[status] || '❓';
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading client data...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header>
              <h2>
                {isEditMode ? 'Edit Client' : 'Add New Client'}
                {isEditMode && formData.partyId && (
                  <Badge bg="info" className="ms-2">{formData.partyId}</Badge>
                )}
              </h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <Alert.Heading>Error</Alert.Heading>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  {/* Basic Information */}
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5>👤 Basic Information</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter client's full name"
                            disabled={submitting}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter a name.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number *</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter phone number"
                            disabled={submitting}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter a phone number.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address (optional)"
                            disabled={submitting}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter a valid email address.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Address *</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="Enter complete address"
                            disabled={submitting}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter an address.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* CRM Information */}
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5>🎯 CRM Information</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {getSourceIcon(formData.source)} Lead Source
                          </Form.Label>
                          <Form.Select
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            disabled={submitting}
                          >
                            <option value="walk-in">🚶 Walk-in</option>
                            <option value="instagram">📷 Instagram</option>
                            <option value="linkedin">💼 LinkedIn</option>
                            <option value="whatsapp">📱 WhatsApp</option>
                            <option value="referral">👥 Referral</option>
                            <option value="website">🌐 Website</option>
                            <option value="other">📌 Other</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {getPriorityIcon(formData.priority)} Priority Level
                          </Form.Label>
                          <Form.Select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={submitting}
                          >
                            <option value="low">🟢 Low Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="high">🔴 High Priority</option>
                          </Form.Select>
                          <Form.Text className="text-muted">
                            High priority clients need immediate attention
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {getDealStatusIcon(formData.dealStatus)} Deal Status
                          </Form.Label>
                          <Form.Select
                            name="dealStatus"
                            value={formData.dealStatus}
                            onChange={handleChange}
                            disabled={submitting}
                          >
                            <option value="in_progress">⏳ In Progress</option>
                            <option value="won">🎉 Won</option>
                            <option value="lost">❌ Lost</option>
                            <option value="on_hold">⏸️ On Hold</option>
                          </Form.Select>
                        </Form.Group>

                        {/* Tags Section */}
                        <Form.Group className="mb-3">
                          <Form.Label>🏷️ Tags</Form.Label>
                          <InputGroup className="mb-2">
                            <Form.Control
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Add tags (e.g., VIP, Urgent, etc.)"
                              disabled={submitting}
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={handleAddTag}
                              disabled={submitting}
                            >
                              Add
                            </Button>
                          </InputGroup>
                          <div>
                            {formData.tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                bg="secondary" 
                                className="me-2 mb-2"
                                style={{ cursor: submitting ? 'default' : 'pointer' }}
                                onClick={submitting ? undefined : () => handleRemoveTag(tag)}
                                title={submitting ? tag : "Click to remove"}
                              >
                                {tag} {!submitting && '✕'}
                              </Badge>
                            ))}
                          </div>
                          <Form.Text className="text-muted">
                            Tags help organize and categorize clients
                          </Form.Text>
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Requirements Section */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5>📋 Requirements & Notes</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Client Requirements</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="What are the client's specific requirements, preferences, or special requests?"
                        disabled={submitting}
                      />
                      <Form.Text className="text-muted">
                        Document the client's needs, budget, timeline, and any special requirements
                      </Form.Text>
                    </Form.Group>

                    {!isEditMode && (
                      <Form.Group className="mb-3">
                        <Form.Label>Initial Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="initialComment"
                          value={formData.initialComment}
                          onChange={handleChange}
                          placeholder="Add any initial notes about this client (optional)"
                          disabled={submitting}
                        />
                        <Form.Text className="text-muted">
                          This will be added as the first comment in the client's activity trail
                        </Form.Text>
                      </Form.Group>
                    )}

                    {isEditMode && (
                      <Form.Group className="mb-3">
                        <Form.Label>Update Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="initialComment"
                          value={formData.initialComment}
                          onChange={handleChange}
                          placeholder="Add a note about these changes (optional)"
                          disabled={submitting}
                        />
                        <Form.Text className="text-muted">
                          This note will be added to the client's activity trail
                        </Form.Text>
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>

                {/* Form Actions */}
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/parties')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Client' : 'Add Client'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PartyForm;