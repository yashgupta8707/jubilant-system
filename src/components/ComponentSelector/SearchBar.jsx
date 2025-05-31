// client/src/components/ComponentSelector/SearchBar.js
// Version compatible with your existing backend structure
import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

// Create API instance that matches your backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const SearchBar = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  
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

  // Fetch categories, brands, and all models on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching initial data...');
        
        const [categoriesRes, brandsRes, modelsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/models')
        ]);
        
        console.log('✅ Categories loaded:', categoriesRes.data.length);
        console.log('✅ Brands loaded:', brandsRes.data.length);
        console.log('✅ Models loaded:', modelsRes.data.length);
        
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
        setAllModels(modelsRes.data);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Log specific error details
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Request error:', error.request);
        } else {
          console.error('Setup error:', error.message);
        }
      }
    };

    fetchData();
  }, []);

  // Search for models as user types
  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 Searching for:', searchTerm);
        
        // Try your backend search endpoint first
        let response;
        try {
          // Use the exact endpoint structure from your modelController
          response = await api.get(`/models/search?term=${encodeURIComponent(searchTerm)}`);
          console.log('✅ API search successful, found:', response.data.length, 'results');
        } catch (apiError) {
          console.log('⚠️ API search failed, using local filtering');
          console.log('API Error:', apiError.response?.status, apiError.response?.data);
          
          // Fallback: filter locally from all models
          const filteredModels = allModels.filter(model => 
            model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.hsn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          console.log('📋 Local search found:', filteredModels.length, 'results');
          response = { data: filteredModels };
        }
        
        setSearchResults(response.data);
      } catch (error) {
        console.error('❌ Error searching models:', error);
        setSearchResults([]);
      }
      setLoading(false);
    };

    const debounce = setTimeout(() => {
      search();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchTerm, allModels]);

  const handleSelect = (model) => {
    console.log('📦 Selected model:', model.name);
    onSelect(model);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleCreateNewClick = () => {
    setNewModel({
      ...newModel,
      name: searchTerm
    });
    setShowCreateModal(true);
  };

  const handleNewModelChange = (e) => {
    const { name, value } = e.target;
    setNewModel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewModelSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🆕 Creating new model:', newModel.name);
      
      // Convert string values to numbers
      const formattedModel = {
        ...newModel,
        purchasePrice: parseFloat(newModel.purchasePrice) || 0,
        salesPrice: parseFloat(newModel.salesPrice) || 0,
        gstRate: parseFloat(newModel.gstRate) || 18
      };
      
      console.log('📝 Formatted model data:', formattedModel);
      
      const response = await api.post('/models', formattedModel);
      console.log('✅ Model created successfully:', response.data);
      
      // Update local models list
      setAllModels(prev => [...prev, response.data]);
      
      onSelect(response.data);
      setShowCreateModal(false);
      setSearchTerm('');
      
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
      
    } catch (error) {
      console.error('❌ Error creating new model:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Failed to create model: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('Failed to create model. Please check your connection and try again.');
      }
    }
  };

  const handleCreateNewCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName) return;
    
    try {
      console.log('🆕 Creating new category:', categoryName);
      const response = await api.post('/categories', { name: categoryName });
      console.log('✅ Category created:', response.data);
      
      setCategories(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, category: response.data._id }));
    } catch (error) {
      console.error('❌ Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleCreateNewBrand = async () => {
    const brandName = prompt('Enter new brand name:');
    if (!brandName) return;
    
    try {
      console.log('🆕 Creating new brand:', brandName);
      const response = await api.post('/brands', { name: brandName });
      console.log('✅ Brand created:', response.data);
      
      setBrands(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, brand: response.data._id }));
    } catch (error) {
      console.error('❌ Error creating brand:', error);
      alert('Failed to create brand. Please try again.');
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Search Components</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search by model name, HSN code, category, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Form.Text className="text-muted">
          {allModels.length > 0 
            ? `${allModels.length} models available. Type at least 2 characters to search.`
            : 'Loading models...'
          }
        </Form.Text>
      </Form.Group>
      
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Searching...
        </div>
      )}
      
      {searchResults.length > 0 && (
        <ListGroup className="mb-3">
          {searchResults.map(model => (
            <ListGroup.Item
              key={model._id}
              action
              onClick={() => handleSelect(model)}
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div><strong>{model.name}</strong></div>
                <div className="text-muted small">
                  {model.category?.name || 'No Category'} | {model.brand?.name || 'No Brand'} | HSN: {model.hsn}
                </div>
              </div>
              <div className="text-end">
                <div>₹{model.salesPrice?.toLocaleString()}</div>
                <small className="text-muted">Sales Price</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
        <div className="text-center mb-3 p-3 bg-light rounded">
          <div className="mb-2">
            <i className="fas fa-search fa-2x text-muted"></i>
          </div>
          <p className="mb-2">No models found for "{searchTerm}"</p>
          <p className="text-muted small mb-3">Would you like to create a new model?</p>
          <Button variant="primary" onClick={handleCreateNewClick}>
            <i className="fas fa-plus me-2"></i>
            Create New Model
          </Button>
        </div>
      )}

      {/* Modal for creating new model */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewModelSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Model Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newModel.name}
                    onChange={handleNewModelChange}
                    required
                    placeholder="Enter model name"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      name="category"
                      value={newModel.category}
                      onChange={handleNewModelChange}
                      required
                      className="me-2"
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
                      type="button"
                      title="Create new category"
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Brand *</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      name="brand"
                      value={newModel.brand}
                      onChange={handleNewModelChange}
                      required
                      className="me-2"
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
                      type="button"
                      title="Create new brand"
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>HSN Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="hsn"
                    value={newModel.hsn}
                    onChange={handleNewModelChange}
                    required
                    placeholder="e.g., 84733020"
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Warranty *</Form.Label>
                  <Form.Control
                    type="text"
                    name="warranty"
                    value={newModel.warranty}
                    onChange={handleNewModelChange}
                    required
                    placeholder="e.g., 1 Year, 3 Years, Lifetime"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Price (with GST) *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={newModel.purchasePrice}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Sales Price (with GST) *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <Form.Control
                      type="number"
                      name="salesPrice"
                      value={newModel.salesPrice}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>GST Rate (%) *</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="number"
                      name="gstRate"
                      value={newModel.gstRate}
                      onChange={handleNewModelChange}
                      required
                      min="0"
                      max="28"
                      step="0.01"
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </Form.Group>
              </div>
            </div>
            
            <div className="border-top pt-3">
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)} 
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <i className="fas fa-save me-2"></i>
                  Create Model
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SearchBar;