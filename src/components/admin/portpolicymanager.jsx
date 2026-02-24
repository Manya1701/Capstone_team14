import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaSave, FaBan, FaCheckCircle } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PortPolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [globalBlacklist, setGlobalBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    port: '',
    type: 'whitelist',
    userId: '',
    reason: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPortPolicies?.() || { data: [] };
      setPolicies(response.data);
      // Separate global blacklist
      const global = response.data.filter(p => p.type === 'blacklist' && !p.userId);
      setGlobalBlacklist(global);
    } catch (error) {
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await adminAPI.createPolicy?.(formData);
      toast.success('Policy created successfully');
      setShowModal(false);
      setFormData({ port: '', type: 'whitelist', userId: '', reason: '' });
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to create policy');
    }
  };

  const handleDelete = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await adminAPI.deletePolicy?.(policyId);
        toast.success('Policy deleted');
        fetchPolicies();
      } catch (error) {
        toast.error('Failed to delete policy');
      }
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
      <div className="d-flex justify-content-between mb-3">
        <h5>Port Access Policies</h5>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <FaPlus /> New Policy
        </Button>
      </div>

      <Tabs defaultActiveKey="all" className="mb-3">
        <Tab eventKey="all" title="All Policies">
          <Table striped hover>
            <thead>
              <tr>
                <th>Port</th>
                <th>Type</th>
                <th>Applied To</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td><Badge bg="dark">{policy.port}</Badge></td>
                  <td>
                    <Badge bg={policy.type === 'whitelist' ? 'success' : 'danger'}>
                      {policy.type}
                    </Badge>
                  </td>
                  <td>
                    {policy.userId ? policy.username : <span className="text-muted">Global</span>}
                  </td>
                  <td>
                    <small>{policy.reason || '-'}</small>
                  </td>
                  <td>
                    <small>
                      {new Date(policy.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="global" title="Global Blacklist">
          <Table striped>
            <thead>
              <tr>
                <th>Port</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalBlacklist.map((policy) => (
                <tr key={policy.id}>
                  <td><Badge bg="danger">{policy.port}</Badge></td>
                  <td>{policy.reason || 'No reason provided'}</td>
                  <td>{new Date(policy.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Create Policy Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Create New Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Port Number</Form.Label>
              <Form.Control
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: e.target.value})}
                min="1"
                max="65535"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Policy Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="whitelist">Whitelist</option>
                <option value="blacklist">Blacklist</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Apply to User (Optional - leave empty for global)</Form.Label>
              <Form.Select
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              >
                <option value="">Global Policy</option>
                {/* Add user options here */}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Reason for this policy"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <FaSave /> Create Policy
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PortPolicyManager;