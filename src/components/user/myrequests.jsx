import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { requestAPI } from '../../services/api';
import StatusBadge from '../common/StatusBadge';

const MyRequests = ({ limit }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getMyRequests();
      const data = limit ? response.data.slice(0, limit) : response.data;
      setRequests(data);
    } catch (error) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No requests found</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped hover className="mb-0">
        <thead>
          <tr>
            <th>Port</th>
            <th>Service</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Reviewed</th>
            <th>Admin Comment</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td><strong>{request.port}</strong></td>
              <td>{request.service}</td>
              <td><StatusBadge status={request.status} /></td>
              <td>{format(new Date(request.requestedAt), 'MMM dd, yyyy')}</td>
              <td>
                {request.reviewedAt 
                  ? format(new Date(request.reviewedAt), 'MMM dd, yyyy')
                  : '-'
                }
              </td>
              <td>
                <small className="text-muted">
                  {request.adminComment || '-'}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MyRequests;