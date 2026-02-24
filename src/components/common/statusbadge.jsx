import React from 'react';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status }) => {
  const getVariant = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'denied':
        return 'danger';
      case 'revoked':
        return 'secondary';
      default:
        return 'light';
    }
  };

  return (
    <Badge bg={getVariant()} className="text-capitalize">
      {status}
    </Badge>
  );
};

export default StatusBadge;