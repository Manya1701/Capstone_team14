import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  InputGroup, Spinner, Badge, Pagination 
} from 'react-bootstrap';
import { 
  FaSearch, FaDownload, FaFilter, FaEye, 
  FaUser, FaCalendar, FaGlobe 
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NavigationBar from '../common/Navbar';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    action: '',
    username: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showDetails, setShowDetails] = useState(null);
  const [actions] = useState([
    'LOGIN', 'LOGOUT', 'CREATE_REQUEST', 'APPROVE_REQUEST', 
    'DENY_REQUEST', 'WHITELIST_PORT', 'BLACKLIST_PORT', 
    'CREATE_USER', 'UPDATE_USER'
  ]);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters.page, filters.limit]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs(filters);
      setLogs(response.data.logs);
      setTotalPages(Math.ceil(response.data.total / filters.limit));
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setFilters({ ...filters, page: 1 });
    fetchAuditLogs();
  };

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportAuditLogs(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const getActionBadge = (action) => {
    const variants = {
      'LOGIN': 'info',
      'LOGOUT': 'secondary',
      'CREATE_REQUEST': 'primary',
      'APPROVE_REQUEST': 'success',
      'DENY_REQUEST': 'danger',
      'WHITELIST_PORT': 'success',
      'BLACKLIST_PORT': 'danger',
      'CREATE_USER': 'success',
      'UPDATE_USER': 'warning'
    };
    return <Badge bg={variants[action] || 'light'}>{action}</Badge>;
  };

  return (
    <>
      <NavigationBar />
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Audit Log Viewer</h4>
                <Button variant="light" size="sm" onClick={handleExport}>
                  <FaDownload className="me-2" /> Export Logs
                </Button>
              </Card.Header>
              <Card.Body>
                {/* Filters */}
                <Row className="mb-4">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Date Range</Form.Label>
                      <div className="d-flex gap-2">
                        <DatePicker
                          className="form-control"
                          placeholderText="Start Date"
                          selected={filters.startDate}
                          onChange={(date) => setFilters({...filters, startDate: date})}
                          selectsStart
                          startDate={filters.startDate}
                          endDate={filters.endDate}
                          maxDate={new Date()}
                        />
                        <DatePicker
                          className="form-control"
                          placeholderText="End Date"
                          selected={filters.endDate}
                          onChange={(date) => setFilters({...filters, endDate: date})}
                          selectsEnd
                          startDate={filters.startDate}
                          endDate={filters.endDate}
                          minDate={filters.startDate}
                          maxDate={new Date()}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Action Type</Form.Label>
                      <Form.Select
                        value={filters.action}
                        onChange={(e) => setFilters({...filters, action: e.target.value})}
                      >
                        <option value="">All Actions</option>
                        {actions.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filter by user"
                        value={filters.username}
                        onChange={(e) => setFilters({...filters, username: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                      >
                        <option value="">All</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILURE">Failure</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3} className="d-flex align-items-end">
                    <Button variant="primary" className="w-100" onClick={handleFilter}>
                      <FaSearch className="me-2" /> Apply Filters
                    </Button>
                  </Col>
                </Row>

                {/* Logs Table */}
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>IP Address</th>
                            <th>Status</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => (
                            <React.Fragment key={log.id}>
                              <tr>
                                <td>
                                  <small>
                                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                  </small>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaUser className="me-2 text-muted" />
                                    <div>
                                      <div>{log.username}</div>
                                      <small className="text-muted">{log.userRole}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>{getActionBadge(log.action)}</td>
                                <td>
                                  <div>
                                    <div>{log.entityType}</div>
                                    <small className="text-muted">{log.entityId}</small>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaGlobe className="me-2 text-muted" />
                                    <small>{log.ipAddress}</small>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg={log.status === 'SUCCESS' ? 'success' : 'danger'}>
                                    {log.status}
                                  </Badge>
                                </td>
                                <td>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                                  >
                                    <FaEye /> View
                                  </Button>
                                </td>
                              </tr>
                              {showDetails === log.id && (
                                <tr className="bg-light">
                                  <td colSpan="7">
                                    <div className="p-3">
                                      <h6>Details:</h6>
                                      <Row>
                                        <Col md={6}>
                                          <strong>User Agent:</strong>
                                          <p className="text-muted small">{log.userAgent}</p>
                                        </Col>
                                        <Col md={6}>
                                          <strong>Changes:</strong>
                                          {log.oldValue && (
                                            <div className="mt-2">
                                              <Badge bg="warning" text="dark">Old Value</Badge>
                                              <pre className="bg-white p-2 rounded mt-1 small">
                                                {JSON.stringify(log.oldValue, null, 2)}
                                              </pre>
                                            </div>
                                          )}
                                          {log.newValue && (
                                            <div className="mt-2">
                                              <Badge bg="info">New Value</Badge>
                                              <pre className="bg-white p-2 rounded mt-1 small">
                                                {JSON.stringify(log.newValue, null, 2)}
                                              </pre>
                                            </div>
                                          )}
                                          {log.errorMessage && (
                                            <div className="mt-2">
                                              <Badge bg="danger">Error</Badge>
                                              <p className="text-danger mt-1">{log.errorMessage}</p>
                                            </div>
                                          )}
                                        </Col>
                                      </Row>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                          <Pagination.Prev
                            onClick={() => setFilters({...filters, page: filters.page - 1})}
                            disabled={filters.page === 1}
                          />
                          {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                              key={i + 1}
                              active={i + 1 === filters.page}
                              onClick={() => setFilters({...filters, page: i + 1})}
                            >
                              {i + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() => setFilters({...filters, page: filters.page + 1})}
                            disabled={filters.page === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AuditLogViewer;