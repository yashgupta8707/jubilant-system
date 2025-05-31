// client/src/components/ComponentLibrary/ComponentsList.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { modelService, categoryService, brandService } from '../../services/api';

const ComponentsList = () => {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    category: '',
    brand: '',
    hsn: '',
    warranty: '',
    purchasePrice: '',
    salesPrice: '',
    gstRate: '18'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes, categoriesRes, brandsRes] = await Promise.all([
          modelService.getAll(),
          categoryService.getAll(),
          brandService.getAll()
        ]);
        
        setModels(modelsRes.data);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewModelChange = (e) => {
    const { name, value } = e.target;
    setNewModel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateNewCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName) return;
    
    try {
      const response = await categoryService.create({ name: categoryName });
      setCategories(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, category: response.data._id }));
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateNewBrand = async () => {
    const brandName = prompt('Enter new brand name:');
    if (!brandName) return;
    
    try {
      const response = await brandService.create({ name: brandName });
      setBrands(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, brand: response.data._id }));
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    
    try {
      // Convert string values to numbers
      const formattedModel = {
        ...newModel,
        purchasePrice: parseFloat(newModel.purchasePrice),
        salesPrice: parseFloat(newModel.salesPrice),
        gstRate: parseFloat(newModel.gstRate)
      };
      
      const response = await modelService.create(formattedModel);
      setModels(prev => [...prev, response.data]);
      
      // Reset form
      setNewModel({
        name: '',
        category: '',
        brand: '',
        hsn: '',
        warranty: '',
        purchasePrice: '',
        salesPrice: '',
        gstRate: '18'
      });
      
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  // Filter models based on search and filters
  const filteredModels = models.filter(model => {
    const matchesSearch = searchTerm === '' || 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.hsn.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || model.category._id === categoryFilter;
    const matchesBrand = brandFilter === '' || model.brand._id === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Component Library</h2>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Component'}
          </Button>
        </Col>
      </Row>

      {showAddForm && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Add New Component</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleAddModel}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Model Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newModel.name}
                      onChange={handleNewModelChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <InputGroup>
                      <Form.Select
                        name="category"
                        value={newModel.category}
                        onChange={handleNewModelChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCreateNewCategory}
                      >
                        +
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <InputGroup>
                      <Form.Select
                        name="brand"
                        value={newModel.brand}
                        onChange={handleNewModelChange}
                        required
                      >
                        <option value="">Select Brand</option>
                        {brands.map(brand => (
                          <option key={brand._id} value={brand._id}>
                            {brand.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCreateNewBrand}
                      >
                        +
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="hsn"
                      value={newModel.hsn}
                      onChange={handleNewModelChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Warranty</Form.Label>
                    <Form.Control
                      type="text"
                      name="warranty"
                      value={newModel.warranty}
                      onChange={handleNewModelChange}
                      required
                      placeholder="e.g., 1 Year"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Price (with GST)</Form.Label>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={newModel.purchasePrice}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Sales Price (with GST)</Form.Label>
                    <Form.Control
                      type="number"
                      name="salesPrice"
                      value={newModel.salesPrice}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>GST Rate (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="gstRate"
                      value={newModel.gstRate}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      max="28"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowAddForm(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Component
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Row>
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by name or HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {filteredModels.length === 0 ? (
            <div className="text-center p-4">
              <p>No components found. Try adjusting your search filters or add a new component.</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>HSN</th>
                  <th>Warranty</th>
                  <th>Purchase Price</th>
                  <th>Sales Price</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map(model => (
                  <tr key={model._id}>
                    <td>{model.name}</td>
                    <td>{model.category.name}</td>
                    <td>{model.brand.name}</td>
                    <td>{model.hsn}</td>
                    <td>{model.warranty}</td>
                    <td>₹{model.purchasePrice.toLocaleString()}</td>
                    <td>₹{model.salesPrice.toLocaleString()}</td>
                    <td>
                      {model.purchasePrice > 0 ? (
                        <>
                          ₹{(model.salesPrice - model.purchasePrice).toLocaleString()}{' '}
                          ({((model.salesPrice - model.purchasePrice) / model.purchasePrice * 100).toFixed(2)}%)
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComponentsList;