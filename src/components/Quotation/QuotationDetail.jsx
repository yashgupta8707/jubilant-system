// client/src/components/Quotation/QuotationDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
} from "react-bootstrap";
import { quotationService } from "../../services/api";
import QuotationPDFButton from "./QuotationPDFButton";

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [relatedQuotations, setRelatedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await quotationService.getById(id);
        setQuotation(response.data);

        const initializedComponents = response.data.components.map(
          (component) => {
            const purchaseWithoutGst = component.purchasePrice || 0;
            const salesWithoutGst = component.salesPrice || 0;
            return {
              ...component,
              purchaseWithoutGst,
              purchaseWithGst: +(purchaseWithoutGst * 1.18).toFixed(2),
              salesWithoutGst,
              salesWithGst: +(salesWithoutGst * 1.18).toFixed(2),
              margin: +(salesWithoutGst - purchaseWithoutGst).toFixed(2),
            };
          }
        );
        setComponents(initializedComponents);

        if (response.data.party) {
          const allQuotesResponse = await quotationService.getByParty(
            response.data.party._id
          );
          const originalId = response.data.originalQuote
            ? response.data.originalQuote._id
            : response.data._id;
          const related = allQuotesResponse.data.filter(
            (quote) =>
              quote._id === originalId ||
              (quote.originalQuote &&
                (quote.originalQuote === originalId ||
                  quote.originalQuote._id === originalId))
          );
          setRelatedQuotations(related.filter((quote) => quote._id !== id));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching quotation:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: "secondary",
      sent: "primary",
      lost: "danger",
      sold: "success",
    };
    return (
      <Badge bg={statusMap[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleDeleteQuotation = async () => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await quotationService.delete(id);
        navigate("/quotations");
      } catch (error) {
        console.error("Error deleting quotation:", error);
      }
    }
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = parseFloat(value) || 0;
    updated[index].purchaseWithGst = +(
      updated[index].purchaseWithoutGst * 1.18
    ).toFixed(2);
    updated[index].salesWithGst = +(
      updated[index].salesWithoutGst * 1.18
    ).toFixed(2);
    updated[index].margin = +(
      updated[index].salesWithoutGst - updated[index].purchaseWithoutGst
    ).toFixed(2);
    setComponents(updated);
  };

  const handleDeleteComponent = (index) => {
    const updated = components.filter((_, i) => i !== index);
    setComponents(updated);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!quotation)
    return (
      <Container className="mt-4">
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Quotation not found</Card.Title>
            <Link to="/quotations">
              <Button variant="primary">Back to Quotations</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            Quotation: {quotation.title}
            <span className="ms-2">{getStatusBadge(quotation.status)}</span>
          </h2>
          <p className="text-muted">
            Created on {new Date(quotation.createdAt).toLocaleDateString()}
            {quotation.createdAt !== quotation.updatedAt &&
              ` (Updated: ${new Date(
                quotation.updatedAt
              ).toLocaleDateString()})`}
          </p>
        </Col>
        <Col className="text-end">
          <QuotationPDFButton quotation={quotation} variant="success" />
          <Link to={`/quotations/revise/${id}`}>
            <Button variant="primary" className="me-2">
              Create Revision
            </Button>
          </Link>
          <Link to={`/quotations/edit/${id}`}>
            <Button variant="warning" className="me-2">
              Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDeleteQuotation}>
            Delete
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
              <p>
                <strong>Name:</strong>{" "}
                <Link to={`/parties/${quotation.party._id}`}>
                  {quotation.party.name}
                </Link>
              </p>
              <p>
                <strong>Phone:</strong> {quotation.party.phone}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Email:</strong> {quotation.party.email || "-"}
              </p>
              <p>
                <strong>Address:</strong> {quotation.party.address}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5>Components</h5>
        </Card.Header>
        <Card.Body>
          {components.length > 0 ? (
            <Table responsive striped bordered>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {components.map((component, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <strong>{component.model.name || "Component"}</strong>
                      </div>
                      <div className="text-muted small">
                        {component.category.name} | {component.brand.name}
                      </div>
                    </td>
                    <td>{component.hsn}</td>
                    <td>{component.warranty}</td>
                    <td>{component.quantity}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={component.purchaseWithoutGst}
                        onChange={(e) =>
                          handleComponentChange(
                            index,
                            "purchaseWithoutGst",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>₹{component.purchaseWithGst.toLocaleString()}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={component.salesWithoutGst}
                        onChange={(e) =>
                          handleComponentChange(
                            index,
                            "salesWithoutGst",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>₹{component.salesWithGst.toLocaleString()}</td>
                    <td>₹{component.margin.toLocaleString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteComponent(index)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-4 bg-light rounded">
              <p>No components in this quotation.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Notes</h5>
            </Card.Header>
            <Card.Body>
              {quotation.notes ? (
                <p className="white-space-pre-wrap">{quotation.notes}</p>
              ) : (
                <p className="text-muted">No notes added</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Terms & Conditions</h5>
            </Card.Header>
            <Card.Body>
              {quotation.termsAndConditions ? (
                <p className="white-space-pre-wrap">
                  {quotation.termsAndConditions}
                </p>
              ) : (
                <p className="text-muted">No terms and conditions specified</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h5>Financial Summary</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Purchase:</span>
                <span>₹{quotation.totalPurchase.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total GST Amount:</span>
                <span>₹{quotation.totalTax.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Profit Margin:</span>
                <span>
                  ₹
                  {(
                    quotation.totalAmount - quotation.totalPurchase
                  ).toLocaleString()}
                  (
                  {quotation.totalPurchase > 0
                    ? (
                        ((quotation.totalAmount - quotation.totalPurchase) /
                          quotation.totalPurchase) *
                        100
                      ).toFixed(2)
                    : 0}
                  %)
                </span>
              </div>
            </Col>
            <Col md={6}>
              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between">
                  <h5>Total Amount:</h5>
                  <h5>₹{quotation.totalAmount.toLocaleString()}</h5>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {relatedQuotations.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Related Quotations</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive striped bordered>
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
                {relatedQuotations.map((quote) => (
                  <tr key={quote._id}>
                    <td>{quote.title}</td>
                    <td>{quote.version}</td>
                    <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td>₹{quote.totalAmount.toLocaleString()}</td>
                    <td>{getStatusBadge(quote.status)}</td>
                    <td>
                      <Link to={`/quotations/${quote._id}`}>
                        <Button variant="info" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between mb-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
        <div>
          <Button
            variant="primary"
            className="me-2"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Link to={`/quotations/revise/${id}`}>
            <Button variant="success">Create Revision</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default QuotationDetail;
