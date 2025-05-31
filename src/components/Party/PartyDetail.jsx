// client/src/components/Party/PartyDetail.js - Fixed version without Timeline import
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge, 
  Alert,
  Modal,
  Form,
  Tabs,
  Tab,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  Spinner
} from 'react-bootstrap';
import { partyService, quotationService } from '../../services/api';

const PartyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form states
  const [commentData, setCommentData] = useState({ message: '', type: 'comment' });
  const [followUpData, setFollowUpData] = useState({ date: '', note: '' });
  const [statusData, setStatusData] = useState({ 
    priority: '', 
    dealStatus: '', 
    changeComment: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [partyResponse, quotationsResponse] = await Promise.all([
          partyService.getById(id),
          quotationService.getByParty(id)
        ]);
        
        setParty(partyResponse.data);
        setQuotations(quotationsResponse.data || []);
        setStatusData({
          priority: partyResponse.data.priority || 'medium',
          dealStatus: partyResponse.data.dealStatus || 'in_progress',
          changeComment: ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refreshPartyData = async () => {
    try {
      const response = await partyService.getById(id);
      setParty(response.data);
    } catch (error) {
      console.error('Error refreshing party data:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentData.message.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setModalLoading(true);
      await partyService.addComment(id, commentData);
      setShowCommentModal(false);
      setCommentData({ message: '', type: 'comment' });
      refreshPartyData();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. This feature will be available when the backend is updated.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!followUpData.date) {
      alert('Please select a follow-up date');
      return;
    }

    try {
      setModalLoading(true);
      await partyService.addFollowUp(id, followUpData);
      setShowFollowUpModal(false);
      setFollowUpData({ date: '', note: '' });
      refreshPartyData();
    } catch (error) {
      console.error('Error adding follow-up:', error);
      alert('Failed to add follow-up. This feature will be available when the backend is updated.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setModalLoading(true);
      await partyService.update(id, statusData);
      setShowStatusModal(false);
      setStatusData(prev => ({ ...prev, changeComment: '' }));
      refreshPartyData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId) => {
    try {
      const completionNote = prompt('Add a completion note (optional):');
      await partyService.completeFollowUp(id, followUpId, { completionNote });
      refreshPartyData();
    } catch (error) {
      console.error('Error completing follow-up:', error);
      alert('Failed to complete follow-up. This feature will be available when the backend is updated.');
    }
  };

  const handleDeleteParty = async () => {
    if (window.confirm(`Are you sure you want to delete client ${party.partyId} (${party.name})? This action cannot be undone.`)) {
      try {
        await partyService.delete(id);
        navigate('/parties');
      } catch (error) {
        console.error('Error deleting party:', error);
        setDeleteError(error.response?.data?.message || 'Failed to delete client. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'secondary',
      sent: 'primary',
      lost: 'danger',
      sold: 'success'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status?.toUpperCase() || 'DRAFT'}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const colors = { low: 'success', medium: 'warning', high: 'danger' };
    const icons = { low: '🟢', medium: '🟡', high: '🔴' };
    const displayPriority = priority || 'medium';
    return (
      <Badge bg={colors[displayPriority]} className="d-flex align-items-center gap-1">
        <span>{icons[displayPriority]}</span>
        {displayPriority.toUpperCase()}
      </Badge>
    );
  };

  const getDealStatusBadge = (status) => {
    const colors = {
      in_progress: 'primary',
      won: 'success',
      lost: 'danger',
      on_hold: 'warning'
    };
    const icons = {
      in_progress: '⏳',
      won: '🎉',
      lost: '❌',
      on_hold: '⏸️'
    };
    const displayStatus = status || 'in_progress';
    return (
      <Badge bg={colors[displayStatus]} className="d-flex align-items-center gap-1">
        <span>{icons[displayStatus]}</span>
        {displayStatus.replace('_', ' ').toUpperCase()}
      </Badge>
    );
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

  const getCommentIcon = (type) => {
    const icons = {
      comment: '💬',
      status_change: '🔄',
      priority_change: '⚡',
      follow_up: '📅',
      requirement_update: '📝'
    };
    return icons[type] || '💬';
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading client details...</p>
      </Container>
    );
  }

  if (!party) {
    return (
      <Container className="mt-4">
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Client not found</Card.Title>
            <Card.Text>The client you're looking for doesn't exist or has been deleted.</Card.Text>
            <Link to="/parties">
              <Button variant="primary">Back to Clients</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h2 className="mb-0">
              Client: {party.name}
            </h2>
            <Badge bg="info" className="fs-6">{party.partyId}</Badge>
            {getPriorityBadge(party.priority)}
            {getDealStatusBadge(party.dealStatus)}
          </div>
          <div className="text-muted">
            <span>{getSourceIcon(party.source)} {(party.source || 'walk-in').replace('_', ' ')}</span>
            <span className="mx-2">•</span>
            <span>Client since {new Date(party.createdAt).toLocaleDateString()}</span>
            {party.nextFollowUp?.date && (
              <>
                <span className="mx-2">•</span>
                <span className={`fw-bold ${new Date(party.nextFollowUp.date) < new Date() ? 'text-danger' : 'text-primary'}`}>
                  Next follow-up: {new Date(party.nextFollowUp.date).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </Col>
        <Col className="text-end">
          <Button 
            variant="success" 
            className="me-2"
            onClick={() => setShowFollowUpModal(true)}
          >
            📅 Schedule Follow-up
          </Button>
          <Button 
            variant="info" 
            className="me-2"
            onClick={() => setShowCommentModal(true)}
          >
            💬 Add Note
          </Button>
          <Button 
            variant="warning" 
            className="me-2"
            onClick={() => setShowStatusModal(true)}
          >
            🔄 Update Status
          </Button>
          <Link to={`/quotations/add/${id}`}>
            <Button variant="primary" className="me-2">Create Quotation</Button>
          </Link>
        </Col>
      </Row>

      {/* Error Alerts */}
      {deleteError && (
        <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>
          {deleteError}
        </Alert>
      )}

      {quotations.length > 0 && (
        <Alert variant="warning">
          <Alert.Heading>Cannot Delete Client</Alert.Heading>
          This client has {quotations.length} quotation(s) associated with them. 
          Please delete all quotations first before deleting the client.
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="📋 Overview">
          <Row>
            <Col lg={8}>
              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5>👤 Client Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Party ID:</strong> <Badge bg="info">{party.partyId}</Badge></p>
                      <p><strong>Name:</strong> {party.name}</p>
                      <p><strong>Phone:</strong> {party.phone}</p>
                      <p><strong>Email:</strong> {party.email || '-'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Address:</strong> {party.address}</p>
                      <p><strong>Source:</strong> {getSourceIcon(party.source)} {(party.source || 'walk-in').replace('_', ' ')}</p>
                      <p><strong>Priority:</strong> {getPriorityBadge(party.priority)}</p>
                      <p><strong>Deal Status:</strong> {getDealStatusBadge(party.dealStatus)}</p>
                    </Col>
                  </Row>
                  
                  {party.tags && party.tags.length > 0 && (
                    <div className="mb-3">
                      <strong>Tags:</strong>
                      <div className="mt-2">
                        {party.tags.map((tag, index) => (
                          <Badge key={index} bg="secondary" className="me-2 mb-1">
                            🏷️ {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {party.requirements && (
                    <div>
                      <strong>Requirements:</strong>
                      <p className="mt-2 p-3 bg-light rounded">{party.requirements}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Follow-up Information */}
              {(party.nextFollowUp?.date || (party.followUps && party.followUps.length > 0)) && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5>📅 Follow-up Schedule</h5>
                  </Card.Header>
                  <Card.Body>
                    {party.nextFollowUp?.date && (
                      <Alert variant={new Date(party.nextFollowUp.date) < new Date() ? 'danger' : 'info'}>
                        <strong>Next Follow-up:</strong> {new Date(party.nextFollowUp.date).toLocaleDateString()}
                        {party.nextFollowUp.note && (
                          <div className="mt-2">
                            <strong>Note:</strong> {party.nextFollowUp.note}
                          </div>
                        )}
                        {new Date(party.nextFollowUp.date) < new Date() && (
                          <Badge bg="danger" className="mt-2">Overdue</Badge>
                        )}
                      </Alert>
                    )}

                    {party.followUps && party.followUps.length > 0 && (
                      <div>
                        <h6>Recent Follow-ups:</h6>
                        {party.followUps
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5)
                          .map((followUp, index) => (
                            <div key={followUp._id || index} className="mb-2 p-2 border rounded">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <strong>{new Date(followUp.date).toLocaleDateString()}</strong>
                                  {followUp.note && <div className="text-muted">{followUp.note}</div>}
                                </div>
                                <div>
                                  {followUp.completed ? (
                                    <Badge bg="success">Completed</Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline-success"
                                      onClick={() => handleCompleteFollowUp(followUp._id)}
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={4}>
              {/* Quick Actions */}
              <Card className="mb-4">
                <Card.Header>
                  <h5>⚡ Quick Actions</h5>
                </Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Link to={`/parties/edit/${id}`}>
                    <Button variant="warning" className="w-100">✏️ Edit Client</Button>
                  </Link>
                  <Button 
                    variant="info" 
                    className="w-100"
                    onClick={() => setShowCommentModal(true)}
                  >
                    💬 Add Note
                  </Button>
                  <Button 
                    variant="success" 
                    className="w-100"
                    onClick={() => setShowFollowUpModal(true)}
                  >
                    📅 Schedule Follow-up
                  </Button>
                  <Link to={`/quotations/add/${id}`}>
                    <Button variant="primary" className="w-100">📄 New Quotation</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    className="w-100"
                    onClick={handleDeleteParty}
                    disabled={quotations.length > 0}
                  >
                    🗑️ Delete Client
                  </Button>
                </Card.Body>
              </Card>

              {/* Statistics */}
              <Card>
                <Card.Header>
                  <h5>📊 Statistics</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>Total Quotations:</strong> 
                    <Badge bg="primary" className="ms-2">{quotations.length}</Badge>
                  </div>
                  <div className="mb-2">
                    <strong>Total Quotation Value:</strong> 
                    <Badge bg="success" className="ms-2">
                      ₹{quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <strong>Comments/Notes:</strong> 
                    <Badge bg="info" className="ms-2">{party.comments?.length || 0}</Badge>
                  </div>
                  <div>
                    <strong>Follow-ups:</strong> 
                    <Badge bg="warning" className="ms-2">{party.followUps?.length || 0}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Activity Trail Tab */}
        <Tab eventKey="activity" title="📝 Activity Trail">
          <Card>
            <Card.Header>
              <h5>📝 Communication & Activity History</h5>
            </Card.Header>
            <Card.Body>
              {party.comments && party.comments.length > 0 ? (
                <div className="activity-timeline">
                  {party.comments
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((comment, index) => (
                      <div key={comment._id || index} className="mb-4 p-3 border-start border-3 border-primary position-relative">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span>{getCommentIcon(comment.type)}</span>
                            <strong>{comment.commentedByName || 'System User'}</strong>
                            <Badge bg="light" text="dark">
                              {(comment.type || 'comment').replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-muted">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </Tooltip>
                              }
                            >
                              <span>{formatRelativeTime(comment.createdAt)}</span>
                            </OverlayTrigger>
                          </div>
                        </div>
                        <p className="mb-0">{comment.message}</p>
                        {comment.metadata && (
                          <div className="mt-2 p-2 bg-light rounded">
                            <small className="text-muted">
                              Changed from "{comment.metadata.oldValue}" to "{comment.metadata.newValue}"
                            </small>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <div className="mb-3">
                    <i className="bi bi-chat-dots" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                  <p>No activity recorded yet.</p>
                  <p className="small">Start tracking your interactions with this client by adding your first note.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowCommentModal(true)}
                  >
                    Add First Note
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Quotations Tab */}
        <Tab eventKey="quotations" title={`📄 Quotations (${quotations.length})`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Quotations ({quotations.length})</h3>
            {quotations.length > 0 && (
              <div>
                <Badge bg="secondary" className="me-2">
                  Total: {quotations.length}
                </Badge>
                <Badge bg="success">
                  Total Value: ₹{quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0).toLocaleString()}
                </Badge>
              </div>
            )}
          </div>

          {quotations.length === 0 ? (
            <Card className="text-center p-4">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                </div>
                <Card.Title>No quotations found</Card.Title>
                <Card.Text>
                  This client doesn't have any quotations yet. Create your first quotation for this client.
                </Card.Text>
                <Link to={`/quotations/add/${id}`}>
                  <Button variant="primary">Create Quotation</Button>
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => (
                  <tr key={quote._id}>
                    <td>
                      <Link to={`/quotations/${quote._id}`}>
                        <Badge bg="light" text="dark" className="me-1">
                          {quote.title || `Quote #${quote._id?.slice(-6) || 'N/A'}`}
                        </Badge>
                      </Link>
                      {quote.originalQuote && (
                        <Badge bg="info" size="sm" className="ms-1">
                          Revision
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={quote.version === 1 ? 'primary' : 'secondary'}>
                        V{quote.version || 1}
                      </Badge>
                    </td>
                    <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td>₹{(quote.totalAmount || 0).toLocaleString()}</td>
                    <td>{getStatusBadge(quote.status)}</td>
                    <td>
                      <Link to={`/quotations/${quote._id}`}>
                        <Button variant="info" size="sm" className="me-2">View</Button>
                      </Link>
                      <Link to={`/quotations/edit/${quote._id}`}>
                        <Button variant="warning" size="sm" className="me-2">Edit</Button>
                      </Link>
                      <Link to={`/quotations/revise/${quote._id}`}>
                        <Button variant="primary" size="sm">Revise</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* Add Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>💬 Add Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Note Type</Form.Label>
            <Form.Select
              value={commentData.type}
              onChange={(e) => setCommentData(prev => ({...prev, type: e.target.value}))}
            >
              <option value="comment">💬 General Note</option>
              <option value="follow_up">📅 Follow-up Note</option>
              <option value="requirement_update">📝 Requirement Update</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={commentData.message}
              onChange={(e) => setCommentData(prev => ({...prev, message: e.target.value}))}
              placeholder="Enter your note here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddComment}
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Adding...
              </>
            ) : (
              'Add Note'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Follow-up Modal */}
      <Modal show={showFollowUpModal} onHide={() => setShowFollowUpModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📅 Schedule Follow-up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Follow-up Date</Form.Label>
            <Form.Control
              type="date"
              value={followUpData.date}
              onChange={(e) => setFollowUpData(prev => ({...prev, date: e.target.value}))}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Reminder Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={followUpData.note}
              onChange={(e) => setFollowUpData(prev => ({...prev, note: e.target.value}))}
              placeholder="What should you remember for this follow-up?"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFollowUpModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddFollowUp}
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Scheduling...
              </>
            ) : (
              'Schedule Follow-up'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔄 Update Client Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Priority Level</Form.Label>
            <Form.Select
              value={statusData.priority}
              onChange={(e) => setStatusData(prev => ({...prev, priority: e.target.value}))}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Deal Status</Form.Label>
            <Form.Select
              value={statusData.dealStatus}
              onChange={(e) => setStatusData(prev => ({...prev, dealStatus: e.target.value}))}
            >
              <option value="in_progress">⏳ In Progress</option>
              <option value="won">🎉 Won</option>
              <option value="lost">❌ Lost</option>
              <option value="on_hold">⏸️ On Hold</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Change Note (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusData.changeComment}
              onChange={(e) => setStatusData(prev => ({...prev, changeComment: e.target.value}))}
              placeholder="Why are you making this change?"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStatusUpdate}
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartyDetail;