import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { adminAPI, requestAPI } from '../../services/api';
import StatusBadge from '../common/StatusBadge';
import { toast } from 'react-toastify';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, requests]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingRequests();
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = requests.filter(req => 
      req.username?.toLowerCase().includes(term) ||
      req.port?.toString().includes(term) ||
      req.service?.toLowerCase().includes(term)
    );
    setFilteredRequests(filtered);
  };

  const handleAction = (request, action) => {
    setSelectedRequest({ ...request, action });
    setShowModal(true);
    setAdminComment('');
  };

  const submitAction = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      if (selectedRequest.action === 'approve') {
        await requestAPI.approveRequest(selectedRequest.id, adminComment);
        toast.success('Request approved successfully');
      } else {
        if (!adminComment.trim()) {
          toast.error('Comment is required for denial');
          setActionLoading(false);
          return;
        }
        await requestAPI.denyRequest(selectedRequest.id, adminComment);
        toast.success('Request denied');
      }
      
      setShowModal(false);
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by username, port, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <Alert variant="info">No pending requests found</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Port</th>
                <th>Service</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>{request.username}</strong>
                    <br />
                    <small className="text-muted">{request.email}</small>
                  </td>
                  <td><span className="badge bg-dark">{request.port}</span></td>
                  <td>{request.service}</td>
                  <td>
                    <small className="text-muted">{request.reason || '-'}</small>
                  </td>
                  <td>
                    <small>
                      {format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}
                    </small>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleAction(request, 'approve')}
                    >
                      <FaCheck /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction(request, 'deny')}
                    >
                      <FaTimes /> Deny
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className={selectedRequest?.action === 'approve' ? 'bg-success text-white' : 'bg-danger text-white'}>
          <Modal.Title>
            {selectedRequest?.action === 'approve' ? 'Approve Request' : 'Deny Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>User:</strong> {selectedRequest?.username}<br />
            <strong>Port:</strong> {selectedRequest?.port} ({selectedRequest?.service})
          </p>
          
          <Form.Group>
            <Form.Label>Admin Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder={selectedRequest?.action === 'deny' ? 'Reason for denial (required)' : 'Optional comment'}
              required={selectedRequest?.action === 'deny'}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={selectedRequest?.action === 'approve' ? 'success' : 'danger'}
            onClick={submitAction}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : (selectedRequest?.action === 'approve' ? 'Approve' : 'Deny')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PendingRequests;