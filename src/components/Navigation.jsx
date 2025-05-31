// client/src/components/Navigation.js
import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 80px;
            background: linear-gradient(135deg, #9f8769 0%, #ff7700 50%, #a0795e 100%);
            box-shadow: 0 2px 10px rgba(255, 140, 0, 30);
            border-bottom: 3px solid #ff6600;
            z-index: 1030;
            display: flex;
            align-items: center;
            padding: 0 20px;
          }
          
          .navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .navbar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: white !important;
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: bold;
          }
          
          .navbar-brand:hover {
            color: white !important;
            text-decoration: none;
            transform: scale(1.05);
            transition: transform 0.3s ease;
          }
          
          .brand-logo {
            width: 40px;
            height: 40px;
            background-color: #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: #ff6600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          
          .navbar-brand img {
            height: 70px;
          }
          
          .navbar-nav {
            display: flex;
            align-items: center;
            gap: 5px;
            list-style: none;
            margin: 0;
            padding: 0;
            flex-direction: row;
          }
          
          .navbar-nav li {
            display: inline-block;
          }
          
          .nav-link {
            color: black !important;
            text-decoration: none !important;
            font-weight: 500;
            margin: 0 5px;
            padding: 8px 16px;
            border-radius: 20px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            vertical-align: middle;
          }
          
          .nav-link:hover {
            color: white !important;
            text-decoration: none !important;
            background-color: rgba(255, 255, 255, 0.15) !important;
            border: 2px solid rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          .nav-link.active {
            background-color: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: 600;
          }
          
          .nav-link i {
            margin-right: 8px;
            font-size: 1rem;
            width: 16px;
            text-align: center;
          }
          
          .navbar-badge {
            background: #fff;
            color: #333;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: 8px;
            font-weight: 500;
            display: inline-block;
            vertical-align: middle;
          }
          
          .navbar-toggle {
            display: none;
            background: transparent;
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 4px 8px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.2rem;
          }
          
          .navbar-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .navbar-toggle:focus {
            outline: none;
            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
          }
          
          /* Mobile styles */
          @media (max-width: 991px) {
            .custom-navbar {
              height: auto;
              min-height: 80px;
              flex-direction: column;
              align-items: flex-start;
              padding: 15px 20px;
            }
            
            .navbar-container {
              flex-direction: column;
              align-items: flex-start;
              width: 100%;
            }
            
            .navbar-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
            }
            
            .navbar-toggle {
              display: block;
            }
            
            .navbar-nav {
              flex-direction: column;
              width: 100%;
              margin-top: 15px;
              gap: 5px;
              display: ${isMenuOpen ? 'flex' : 'none'};
            }
            
            .navbar-nav li {
              display: block;
              width: 100%;
            }
            
            .nav-link {
              width: 100%;
              text-align: center;
              justify-content: center;
              margin: 5px 0;
              display: flex;
            }
          }
          
          /* Body padding to prevent content hiding */
          body {
            padding-top: 90px !important;
          }
          
          @media (max-width: 991px) {
            body {
              padding-top: 100px !important;
            }
          }
        `
      }} />

      <nav className="custom-navbar">
        <div className="navbar-container">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">
              <img
                src="/logo.png"
                alt="EmpressPC Logo"
                style={{ height: "70px" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <div style={{ fontSize: "1.4rem", lineHeight: "1" }}>
                  EMPRESSPC.IN
                </div>
              </div>
            </Link>
            
            <button 
              className="navbar-toggle"
              onClick={toggleMenu}
              aria-controls="basic-navbar-nav"
            >
              <span>☰</span>
            </button>
          </div>

          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/dashboard"
                className={`nav-link ${
                  location.pathname === "/dashboard" || location.pathname === "/" ? "active" : ""
                }`}
              >
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/parties"
                className={`nav-link ${
                  location.pathname.includes("/parties") ? "active" : ""
                }`}
              >
                <i className="fas fa-users"></i>
                Clients
                <span className="navbar-badge">CRM</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/quotations"
                className={`nav-link ${
                  location.pathname.includes("/quotations") ? "active" : ""
                }`}
              >
                <i className="fas fa-file-invoice-dollar"></i>
                Quotations
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/components"
                className={`nav-link ${
                  location.pathname.includes("/components") ? "active" : ""
                }`}
              >
                <i className="fas fa-microchip"></i>
                Components
              </NavLink>
            </li>

            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  // Add settings/profile functionality here
                }}
              >
                <i className="fas fa-cog"></i>
                Settings
              </a>
            </li>

            <li>
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  // Add help/support functionality here
                }}
              >
                <i className="fas fa-question-circle"></i>
                Help
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;