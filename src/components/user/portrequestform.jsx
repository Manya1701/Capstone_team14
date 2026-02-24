import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { requestAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PortRequestForm = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    port: '',
    service: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const portNum = parseInt(formData.port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port must be between 1 and 65535');
      return false;
    }
    if (!formData.service.trim()) {
      setError('Service name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      await requestAPI.createRequest({
        port: parseInt(formData.port),
        service: formData.service,
        reason: formData.reason
      });
      
      toast.success('Port request submitted successfully!');
      setFormData({ port: '', service: '', reason: '' });
      onSuccess?.();
      onHide();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request');
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>New Port Access Request</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Port Number <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="port"
              placeholder="e.g., 3306"
              value={formData.port}
              onChange={handleChange}
              min="1"
              max="65535"
              required
            />
            <Form.Text className="text-muted">
              Enter the port number you need access to (1-65535)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="service"
              placeholder="e.g., MySQL, PostgreSQL, MongoDB"
              value={formData.service}
              onChange={handleChange}
              required
              maxLength="50"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason for Request</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              rows={3}
              placeholder="Explain why you need access to this port"
              value={formData.reason}
              onChange={handleChange}
              maxLength="200"
            />
          </Form.Group>

          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Note:</strong> Your request will be reviewed by an administrator. 
              You'll be notified once a decision is made.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PortRequestForm;