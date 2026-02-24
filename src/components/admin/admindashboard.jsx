import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { 
  FaUsers, FaClipboardList, FaCheckCircle, FaClock, 
  FaBan, FaChartBar, FaNetworkWired 
} from 'react-icons/fa';
import NavigationBar from '../common/Navbar';
import PendingRequests from './PendingRequests';
import UserManagement from './UserManagement';
import PortPolicyManager from './PortPolicyManager';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    approvedPorts: 0,
    blacklistedPorts: 0,
    totalRequests: 0,
    activePolicies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch stats from API (implement these endpoints)
      const usersResponse = await adminAPI.getAllUsers();
      const requestsResponse = await adminAPI.getAllRequests?.();
      const policiesResponse = await adminAPI.getPortPolicies?.();
      
      setStats({
        totalUsers: usersResponse.data.length,
        pendingRequests: requestsResponse?.data?.pending || 0,
        approvedPorts: policiesResponse?.data?.approved || 0,
        blacklistedPorts: policiesResponse?.data?.blacklisted || 0,
        totalRequests: requestsResponse?.data?.total || 0,
        activePolicies: policiesResponse?.data?.total || 0
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Container fluid className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="bg-white p-4 rounded shadow-sm">
              <h2>Administrator Dashboard</h2>
              <p className="text-muted mb-0">
                Manage port access requests, users, and security policies
              </p>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="dashboard-card bg-primary text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Users</h6>
                    <h3 className="mb-0">{stats.totalUsers}</h3>
                  </div>
                  <FaUsers size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="dashboard-card bg-warning text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Pending</h6>
                    <h3 className="mb-0">{stats.pendingRequests}</h3>
                  </div>
                  <FaClock size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="dashboard-card bg-success text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Approved</h6>
                    <h3 className="mb-0">{stats.approvedPorts}</h3>
                  </div>
                  <FaCheckCircle size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="dashboard-card bg-danger text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Blacklisted</h6>
                    <h3 className="mb-0">{stats.blacklistedPorts}</h3>
                  </div>
                  <FaBan size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="dashboard-card bg-info text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Requests</h6>
                    <h3 className="mb-0">{stats.totalRequests}</h3>
                  </div>
                  <FaClipboardList size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="dashboard-card bg-secondary text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Policies</h6>
                    <h3 className="mb-0">{stats.activePolicies}</h3>
                  </div>
                  <FaNetworkWired size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Row>
          <Col md={12}>
            <Card className="dashboard-card">
              <Card.Body>
                <Tab.Container defaultActiveKey="pending">
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="pending">
                        <FaClock className="me-2" /> Pending Requests
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="users">
                        <FaUsers className="me-2" /> User Management
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="policies">
                        <FaNetworkWired className="me-2" /> Port Policies
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    <Tab.Pane eventKey="pending">
                      <PendingRequests />
                    </Tab.Pane>
                    <Tab.Pane eventKey="users">
                      <UserManagement />
                    </Tab.Pane>
                    <Tab.Pane eventKey="policies">
                      <PortPolicyManager />
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;