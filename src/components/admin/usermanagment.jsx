import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaUserCog, FaBan, FaCheckCircle, FaSearch, FaPlus } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPortModal, setShowPortModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [portData, setPortData] = useState({
    port: '',
    action: 'whitelist'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleManagePorts = (user) => {
    setSelectedUser(user);
    setShowPortModal(true);
    setPortData({ port: '', action: 'whitelist' });
  };

  const handlePortAction = async () => {
    if (!selectedUser || !portData.port) return;

    try {
      await adminAPI.managePort(
        selectedUser.id,
        parseInt(portData.port),
        portData.action
      );
      
      toast.success(`Port ${portData.action}ed successfully`);
      setShowPortModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
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
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
          </span>
          <Form.Control
            type="text"
            placeholder="Search users by username, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Alert variant="info">No users found</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Allowed Ports</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {user.allowedPorts?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {user.allowedPorts.map((p, idx) => (
                          <Badge key={idx} bg="success">
                            {p.port} ({p.service})
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>
                    <small>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </small>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleManagePorts(user)}
                    >
                      <FaUserCog /> Manage Ports
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Manage Ports Modal */}
      <Modal show={showPortModal} onHide={() => setShowPortModal(false)}>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            Manage Ports - {selectedUser?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Port Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter port number"
                value={portData.port}
                onChange={(e) => setPortData({...portData, port: e.target.value})}
                min="1"
                max="65535"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Action</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Whitelist"
                  name="action"
                  value="whitelist"
                  checked={portData.action === 'whitelist'}
                  onChange={(e) => setPortData({...portData, action: e.target.value})}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Blacklist"
                  name="action"
                  value="blacklist"
                  checked={portData.action === 'blacklist'}
                  onChange={(e) => setPortData({...portData, action: e.target.value})}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Remove"
                  name="action"
                  value="remove"
                  checked={portData.action === 'remove'}
                  onChange={(e) => setPortData({...portData, action: e.target.value})}
                />
              </div>
            </Form.Group>
          </Form>

          {/* Current Ports */}
          <div className="mt-3">
            <h6>Current Allowed Ports:</h6>
            {selectedUser?.allowedPorts?.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {selectedUser.allowedPorts.map((p, idx) => (
                  <Badge key={idx} bg="success">
                    {p.port}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted">No ports whitelisted</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPortModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePortAction}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagement;