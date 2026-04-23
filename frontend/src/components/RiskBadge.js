import React from 'react';
import { getRiskColor, getRiskBg } from '../utils/helpers';

export default function RiskBadge({ level }) {
  if (!level) return null;
  return (
    <span style={{
      color: getRiskColor(level),
      background: getRiskBg(level),
      border: `1px solid ${getRiskColor(level)}40`,
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    }}>
      {level}
    </span>
  );
}
