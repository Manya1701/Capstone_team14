import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaTachometerAlt, FaHistory, FaUserShield, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
      <Container fluid>
        <Navbar.Brand as={Link} to={isAdmin ? '/admin' : '/user'}>
          <img
            src="/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Logo"
          />
          Port Access Control
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdmin ? (
              // Admin Navigation
              <>
                <Nav.Link as={Link} to="/admin">
                  <FaTachometerAlt className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/requests">
                  <FaClipboardList className="me-1" /> Requests
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users">
                  <FaUserShield className="me-1" /> Users
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/audit-logs">
                  <FaHistory className="me-1" /> Audit Logs
                </Nav.Link>
              </>
            ) : (
              // User Navigation
              <>
                <Nav.Link as={Link} to="/user">
                  <FaTachometerAlt className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/user/my-requests">
                  <FaHistory className="me-1" /> My Requests
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              Signed in as: <strong>{user?.username}</strong> ({user?.role})
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-1" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;