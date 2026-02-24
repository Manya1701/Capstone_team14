import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';
import { FaPlus, FaCheckCircle, FaClock, FaTimesCircle, FaNetworkWired } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import NavigationBar from '../common/Navbar';
import PortRequestForm from './PortRequestForm';
import MyRequests from './MyRequests';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allowedPorts, setAllowedPorts] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    denied: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const portsResponse = await userAPI.getAllowedPorts();
      setAllowedPorts(portsResponse.data);
      
      // Fetch request stats (you'll need to implement this endpoint)
      const requestsResponse = await userAPI.getRequestStats?.() || { data: { total: 0, pending: 0, approved: 0, denied: 0 } };
      setStats(requestsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Container fluid className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="bg-white p-4 rounded shadow-sm">
              <h2>Welcome back, {user?.username}!</h2>
              <p className="text-muted mb-0">Manage your port access requests and view approved ports</p>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="dashboard-card bg-primary text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Total Requests</h6>
                    <h2 className="mb-0">{stats.totalRequests}</h2>
                  </div>
                  <FaNetworkWired size={40} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="dashboard-card bg-warning text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Pending</h6>
                    <h2 className="mb-0">{stats.pending}</h2>
                  </div>
                  <FaClock size={40} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="dashboard-card bg-success text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Approved</h6>
                    <h2 className="mb-0">{stats.approved}</h2>
                  </div>
                  <FaCheckCircle size={40} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="dashboard-card bg-danger text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Denied</h6>
                    <h2 className="mb-0">{stats.denied}</h2>
                  </div>
                  <FaTimesCircle size={40} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row>
          <Col md={4}>
            <Card className="dashboard-card">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={() => setShowRequestForm(true)}
                >
                  <FaPlus className="me-2" /> New Port Request
                </Button>
                
                <Card className="mt-3">
                  <Card.Header>Your Approved Ports</Card.Header>
                  <Card.Body>
                    {allowedPorts.length > 0 ? (
                      <div className="port-list">
                        {allowedPorts.map((port, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <span>
                              <strong>Port {port.port}:</strong> {port.service}
                            </span>
                            <span className="text-success">
                              <FaCheckCircle />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No approved ports yet</p>
                    )}
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={8}>
            <Card className="dashboard-card">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Recent Requests</h5>
              </Card.Header>
              <Card.Body>
                <MyRequests limit={5} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Port Request Modal */}
        <PortRequestForm 
          show={showRequestForm} 
          onHide={() => setShowRequestForm(false)}
          onSuccess={fetchDashboardData}
        />
      </Container>
    </>
  );
};

export default UserDashboard;