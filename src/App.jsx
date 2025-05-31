// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard/Dashboard';

// Party Components
import PartyList from './components/Party/PartyList';
import PartyForm from './components/Party/PartyForm';
import PartyDetail from './components/Party/PartyDetail';

// Quotation Components
import QuotationList from './components/Quotation/QuotationList';
import QuotationForm from './components/Quotation/QuotationForm';
import QuotationDetail from './components/Quotation/QuotationDetail';

// Component Library
import ComponentsList from './components/ComponentLibrary/ComponentsList';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import EstimatePrint from './components/EstimatePrint';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-container">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Party Routes */}
            <Route path="/parties" element={<PartyList />} />
            <Route path="/parties/add" element={<PartyForm />} />
            <Route path="/parties/edit/:id" element={<PartyForm />} />
            <Route path="/parties/:id" element={<PartyDetail />} />
            
            {/* Quotation Routes */}
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotations/add/:partyId" element={<QuotationForm />} />
            <Route path="/quotations/edit/:id" element={<QuotationForm />} />
            <Route path="/quotations/revise/:reviseId" element={<QuotationForm />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
            <Route path="/estimate" element={<EstimatePrint />} />
            
            {/* Component Library */}
            <Route path="/components" element={<ComponentsList />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="container mt-5 text-center">
                <div className="card">
                  <div className="card-body">
                    <h1 className="display-1">404</h1>
                    <h2>Page Not Found</h2>
                    <p className="lead">The page you're looking for doesn't exist.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.history.back()}
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;