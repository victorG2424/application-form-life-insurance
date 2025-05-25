import React, { useContext, useState } from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../styles/Navbar.css";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleClose = () => setShowMenu(false);
  const handleShow = () => setShowMenu(true);

  return (
    <div className="navbar-wrapper">
      <Navbar expand="lg" className="bg-white shadow-lg rounded-pill custom-navbar">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <img src={logo} alt="Logo" className="logo" />
            </Navbar.Brand>
          </div>

          {/* Menú visible en desktop (oculto en móvil) */}
          <Nav className="d-none d-lg-flex custom-nav">
            <Nav.Link as={Link} to="/" className="nav-item-custom">
              Form
            </Nav.Link>
            <Nav.Link as={Link} to="/clients" className="nav-item-custom">
              Clients
            </Nav.Link>
            {user && (
              <Button variant="outline-danger" size="sm" onClick={logout}>
                Logout
              </Button>
            )}
          </Nav>

          {/* Botón hamburguesa SOLO en móviles */}
          <Button
            variant="light"
            onClick={handleShow}
            className="d-lg-none menu-button"
            aria-label="Toggle menu"
          >
            <span className="navbar-toggler-icon"></span>
          </Button>
        </Container>
      </Navbar>

      {/* Menú lateral en móviles con animación */}
      <div className={`mobile-menu ${showMenu ? "open" : "close"}`}>
        <div className="mobile-menu-content">
          <Button variant="light" onClick={handleClose} className="close-button">
            ✖
          </Button>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" onClick={handleClose}>
              Form
            </Nav.Link>
            <Nav.Link as={Link} to="/clients" onClick={handleClose}>
              Clients
            </Nav.Link>
            {user && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  logout();
                  handleClose();
                }}
              >
                Logout
              </Button>
            )}
          </Nav>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
