// client/src/components/Party/PartyList.js - Enhanced CRM with Notion-like architecture
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { partyService } from '../../services/api';
import { 
  Table, 
  Button, 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  InputGroup, 
  Badge, 
  Dropdown,
  Modal,
  Alert,
  OverlayTrigger,
  Tooltip,
  ButtonGroup
} from 'react-bootstrap';

const PartyList = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFilter: '',
    source: '',
    priority: '',
    dealStatus: '',
    followUpDate: ''
  });
  
  // Modal states
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [followUpData, setFollowUpData] = useState({ date: '', note: '' });
  const [commentData, setCommentData] = useState({ message: '', type: 'comment' });
  
  // Reminders and notifications
  const [todaysFollowUps, setTodaysFollowUps] = useState([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState([]);
  const [showReminders, setShowReminders] = useState(false);

  useEffect(() => {
    fetchParties();
    fetchFollowUpReminders();
  }, [filters]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      }).toString();
      
      const response = await partyService.getAll(queryParams ? `?${queryParams}` : '');
      setParties(response.data.parties || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parties:', error);
      setLoading(false);
    }
  };

  const fetchFollowUpReminders = async () => {
    try {
      const [todaysResponse, overdueResponse] = await Promise.all([
        partyService.getTodaysFollowUps(),
        partyService.getOverdueFollowUps()
      ]);
      setTodaysFollowUps(todaysResponse.data);
      setOverdueFollowUps(overdueResponse.data);
    } catch (error) {
      console.error('Error fetching follow-up reminders:', error);
    }
  };

  // Filter parties based on search term
  const filteredParties = parties.filter(party => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      party.partyId?.toLowerCase().includes(searchLower) ||
      party.name?.toLowerCase().includes(searchLower) ||
      party.phone?.toLowerCase().includes(searchLower) ||
      party.email?.toLowerCase().includes(searchLower) ||
      party.address?.toLowerCase().includes(searchLower) ||
      party.requirements?.toLowerCase().includes(searchLower)
    );
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFilter: '',
      source: '',
      priority: '',
      dealStatus: '',
      followUpDate: ''
    });
    setSearchTerm('');
  };

  const handleAddFollowUp = async () => {
    try {
      await partyService.addFollowUp(selectedParty._id, followUpData);
      setShowFollowUpModal(false);
      setFollowUpData({ date: '', note: '' });
      fetchParties();
      fetchFollowUpReminders();
    } catch (error) {
      console.error('Error adding follow-up:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      await partyService.addComment(selectedParty._id, commentData);
      setShowCommentModal(false);
      setCommentData({ message: '', type: 'comment' });
      fetchParties();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = { low: 'success', medium: 'warning', high: 'danger' };
    const icons = { low: '🟢', medium: '🟡', high: '🔴' };
    return (
      <Badge bg={colors[priority]} className="d-flex align-items-center gap-1">
        <span>{icons[priority]}</span>
        {priority.toUpperCase()}
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
    return <Badge bg={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
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

  const isFollowUpOverdue = (date) => {
    return date && new Date(date) < new Date();
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container fluid className="mt-4">
      {/* Reminders Section */}
      {(todaysFollowUps.length > 0 || overdueFollowUps.length > 0) && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>📅 Follow-up Reminders:</strong>
              {todaysFollowUps.length > 0 && (
                <span className="ms-2">
                  <Badge bg="primary">{todaysFollowUps.length}</Badge> Today
                </span>
              )}
              {overdueFollowUps.length > 0 && (
                <span className="ms-2">
                  <Badge bg="danger">{overdueFollowUps.length}</Badge> Overdue
                </span>
              )}
            </div>
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={() => setShowReminders(!showReminders)}
            >
              {showReminders ? 'Hide' : 'View'} Details
            </Button>
          </div>
          
          {showReminders && (
            <div className="mt-3">
              {todaysFollowUps.map(party => (
                <div key={party._id} className="mb-2 p-2 bg-light rounded">
                  <strong>{party.name} ({party.partyId})</strong> - 
                  Follow up today: {party.nextFollowUp?.note || 'No note'}
                  <Link to={`/parties/${party._id}`} className="ms-2">
                    <Button size="sm" variant="outline-primary">View</Button>
                  </Link>
                </div>
              ))}
              {overdueFollowUps.map(party => (
                <div key={party._id} className="mb-2 p-2 bg-danger-light rounded">
                  <strong>{party.name} ({party.partyId})</strong> - 
                  <span className="text-danger">
                    Overdue: {new Date(party.nextFollowUp?.date).toLocaleDateString()}
                  </span>
                  <Link to={`/parties/${party._id}`} className="ms-2">
                    <Button size="sm" variant="outline-danger">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Alert>
      )}

      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <h2>Client Management (CRM)</h2>
          <p className="text-muted">
            Total Clients: <Badge bg="primary">{parties.length}</Badge>
            {todaysFollowUps.length > 0 && (
              <span className="ms-3">
                Today's Follow-ups: <Badge bg="info">{todaysFollowUps.length}</Badge>
              </span>
            )}
          </p>
        </Col>
        <Col className="text-end">
          <Link to="/parties/add">
            <Button variant="primary">Add New Client</Button>
          </Link>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card className="mb-4">
        <Card.Header>
          <h5>🔍 Filters & Search</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {/* Search Bar */}
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Date Filter */}
            <Col md={2}>
              <Form.Select
                value={filters.dateFilter}
                onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </Form.Select>
            </Col>

            {/* Source Filter */}
            <Col md={2}>
              <Form.Select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="instagram">📷 Instagram</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="walk-in">🚶 Walk-in</option>
                <option value="referral">👥 Referral</option>
                <option value="website">🌐 Website</option>
                <option value="other">📌 Other</option>
              </Form.Select>
            </Col>

            {/* Priority Filter */}
            <Col md={2}>
              <Form.Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </Form.Select>
            </Col>

            {/* Deal Status Filter */}
            <Col md={2}>
              <Form.Select
                value={filters.dealStatus}
                onChange={(e) => handleFilterChange('dealStatus', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="on_hold">On Hold</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
              {searchTerm && (
                <small className="text-muted ms-3">
                  Showing {filteredParties.length} of {parties.length} clients
                </small>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      {parties.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No clients found</Card.Title>
            <Card.Text>
              You haven't added any clients yet. Add your first client to get started.
            </Card.Text>
            <Link to="/parties/add">
              <Button variant="primary">Add New Client</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : filteredParties.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No clients match your filters</Card.Title>
            <Card.Text>
              No clients found matching your current filters. Try adjusting your search criteria.
            </Card.Text>
            <Button variant="outline-primary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Client ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Requirements</th>
                  <th>Deal Status</th>
                  <th>Next Follow-up</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr key={party._id}>
                    <td>
                      <Badge bg="info">{party.partyId}</Badge>
                    </td>
                    <td>
                      <div>
                        <Link to={`/parties/${party._id}`} className="fw-bold text-decoration-none">
                          {party.name}
                        </Link>
                        {party.tags && party.tags.length > 0 && (
                          <div className="mt-1">
                            {party.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} bg="light" text="dark" className="me-1" style={{fontSize: '0.7em'}}>
                                {tag}
                              </Badge>
                            ))}
                            {party.tags.length > 2 && (
                              <Badge bg="light" text="dark" style={{fontSize: '0.7em'}}>
                                +{party.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{party.phone}</div>
                        {party.email && (
                          <small className="text-muted">{party.email}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span title={party.source}>
                        {getSourceIcon(party.source)} {party.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {getPriorityBadge(party.priority)}
                    </td>
                    <td>
                      <div style={{maxWidth: '200px'}}>
                        {party.requirements ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{party.requirements}</Tooltip>}
                          >
                            <span className="text-truncate d-block">
                              {party.requirements.length > 50 
                                ? party.requirements.substring(0, 50) + '...'
                                : party.requirements
                              }
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {getDealStatusBadge(party.dealStatus)}
                    </td>
                    <td>
                      {party.nextFollowUp?.date ? (
                        <div>
                          <div className={`fw-bold ${isFollowUpOverdue(party.nextFollowUp.date) ? 'text-danger' : 'text-primary'}`}>
                            {new Date(party.nextFollowUp.date).toLocaleDateString()}
                          </div>
                          {party.nextFollowUp.note && (
                            <small className="text-muted d-block">
                              {party.nextFollowUp.note.length > 30 
                                ? party.nextFollowUp.note.substring(0, 30) + '...'
                                : party.nextFollowUp.note
                              }
                            </small>
                          )}
                          {isFollowUpOverdue(party.nextFollowUp.date) && (
                            <Badge bg="danger" className="mt-1">Overdue</Badge>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedParty(party);
                            setShowFollowUpModal(true);
                          }}
                        >
                          Schedule
                        </Button>
                      )}
                    </td>
                    <td>
                      <div>
                        <small className="text-muted">
                          {new Date(party.updatedAt || party.createdAt).toLocaleDateString()}
                        </small>
                        {party.comments && party.comments.length > 0 && (
                          <div>
                            <Badge bg="secondary" className="mt-1">
                              {party.comments.length} notes
                            </Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Dropdown as={ButtonGroup}>
                        <Link to={`/parties/${party._id}`}>
                          <Button variant="info" size="sm">View</Button>
                        </Link>
                        
                        <Dropdown.Toggle 
                          split 
                          variant="info" 
                          size="sm"
                          id={`dropdown-split-${party._id}`}
                        />

                        <Dropdown.Menu>
                          <Dropdown.Item
                            as={Link}
                            to={`/parties/edit/${party._id}`}
                          >
                            ✏️ Edit Client
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedParty(party);
                              setShowCommentModal(true);
                            }}
                          >
                            💬 Add Note
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedParty(party);
                              setShowFollowUpModal(true);
                            }}
                          >
                            📅 Schedule Follow-up
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            as={Link}
                            to={`/quotations/add/${party._id}`}
                          >
                            📄 New Quotation
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Follow-up Modal */}
      <Modal show={showFollowUpModal} onHide={() => setShowFollowUpModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Follow-up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParty && (
            <div>
              <p><strong>Client:</strong> {selectedParty.name} ({selectedParty.partyId})</p>
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFollowUpModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddFollowUp}>
            Schedule Follow-up
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParty && (
            <div>
              <p><strong>Client:</strong> {selectedParty.name} ({selectedParty.partyId})</p>
              <Form.Group className="mb-3">
                <Form.Label>Note Type</Form.Label>
                <Form.Select
                  value={commentData.type}
                  onChange={(e) => setCommentData(prev => ({...prev, type: e.target.value}))}
                >
                  <option value="comment">General Note</option>
                  <option value="follow_up">Follow-up Note</option>
                  <option value="requirement_update">Requirement Update</option>
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            Add Note
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartyList;