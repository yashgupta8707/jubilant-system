// client/src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { quotationService, partyService } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParties: 0,
    totalQuotations: 0,
    draftQuotations: 0,
    sentQuotations: 0,
    lostQuotations: 0,
    soldQuotations: 0,
    totalRevenue: 0,
    totalProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [quotationsRes, partiesRes] = await Promise.all([
          quotationService.getAll(),
          partyService.getAll()
        ]);
        
        const quotations = quotationsRes.data;
        const parties = partiesRes.data;
        
        // Calculate stats
        const totalRevenue = quotations
          .filter(q => q.status === 'sold')
          .reduce((sum, q) => sum + q.totalAmount, 0);
          
        const totalProfit = quotations
          .filter(q => q.status === 'sold')
          .reduce((sum, q) => sum + (q.totalAmount - q.totalPurchase), 0);
        
        setStats({
          totalParties: parties.length,
          totalQuotations: quotations.length,
          draftQuotations: quotations.filter(q => q.status === 'draft').length,
          sentQuotations: quotations.filter(q => q.status === 'sent').length,
          lostQuotations: quotations.filter(q => q.status === 'lost').length,
          soldQuotations: quotations.filter(q => q.status === 'sold').length,
          totalRevenue,
          totalProfit
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 bg-light">
            <Card.Body>
              <h3>{stats.totalParties}</h3>
              <Card.Title>Total Clients</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/parties">View Clients</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-light">
            <Card.Body>
              <h3>{stats.totalQuotations}</h3>
              <Card.Title>Total Quotations</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/quotations">View Quotations</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-success text-white">
            <Card.Body>
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <Card.Title>Total Revenue</Card.Title>
            </Card.Body>
            <Card.Footer className="text-white">
              <Link to="/quotations?status=sold" className="text-white">Sold Quotations: {stats.soldQuotations}</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-primary text-white">
            <Card.Body>
              <h3>₹{stats.totalProfit.toLocaleString()}</h3>
              <Card.Title>Total Profit</Card.Title>
            </Card.Body>
            <Card.Footer className="text-white">
              <span>Margin: {stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue * 100).toFixed(2) : 0}%</span>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={3}>
          <Card className="text-center h-100 bg-secondary text-white">
            <Card.Body>
              <h3>{stats.draftQuotations}</h3>
              <Card.Title>Draft Quotations</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/quotations?status=draft" className="text-white">View Drafts</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-info text-white">
            <Card.Body>
              <h3>{stats.sentQuotations}</h3>
              <Card.Title>Sent Quotations</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/quotations?status=sent" className="text-white">View Sent</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-danger text-white">
            <Card.Body>
              <h3>{stats.lostQuotations}</h3>
              <Card.Title>Lost Quotations</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/quotations?status=lost" className="text-white">View Lost</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 bg-success text-white">
            <Card.Body>
              <h3>{stats.soldQuotations}</h3>
              <Card.Title>Sold Quotations</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/quotations?status=sold" className="text-white">View Sold</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;