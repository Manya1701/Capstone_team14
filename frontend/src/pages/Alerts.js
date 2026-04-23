import React, { useState, useEffect, useCallback } from 'react';
import RiskBadge from '../components/RiskBadge';
import { alertAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import './Alerts.css';

export default function Alerts({ lastEvent, onAlertsChange }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('unacknowledged');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    const params = filter === 'unacknowledged' ? { acknowledged: false } : filter === 'acknowledged' ? { acknowledged: true } : {};
    const res = await alertAPI.getAll(params);
    setAlerts(res.data);
    if (onAlertsChange) onAlertsChange(res.data.filter(a => !a.acknowledged).length);
  }, [filter, onAlertsChange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (lastEvent?.type === 'alert:new') load(); }, [lastEvent, load]);

  const handleAck = async (id) => {
    await alertAPI.acknowledge(id);
    showToast('Alert acknowledged', 'success');
    load();
  };

  const handleAckAll = async () => {
    await alertAPI.acknowledgeAll();
    showToast('All alerts acknowledged', 'success');
    load();
  };

  const handleDelete = async (id) => {
    await alertAPI.delete(id);
    showToast('Alert deleted', 'info');
    load();
  };

  const sevIcon = { low: '●', medium: '◉', high: '⚠', critical: '🚨' };

  return (
    <div className="alerts-page animate-fadeIn">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Security Alerts</h1>
          <p className="page-sub text-mono">Triggered by high-risk port detections</p>
        </div>
        {alerts.length > 0 && filter === 'unacknowledged' && (
          <button className="ack-all-btn" onClick={handleAckAll}>✓ Acknowledge All</button>
        )}
      </div>

      <div className="alert-filters">
        {['unacknowledged', 'acknowledged', 'all'].map(f => (
          <button key={f} className={`af-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.replace('unacknowledged', 'Active').replace('acknowledged', 'Resolved').replace('all', 'All')}
          </button>
        ))}
      </div>

      <div className="alert-cards">
        {alerts.length === 0 ? (
          <div className="alerts-empty card">
            <div style={{ fontSize: 36, marginBottom: 12 }}>🟢</div>
            <div>No alerts in this category</div>
          </div>
        ) : alerts.map(a => (
          <div key={a._id} className={`alert-card card alert-card--${a.severity} ${a.acknowledged ? 'acked' : ''}`}>
            <div className="ac-header">
              <span className="ac-icon">{sevIcon[a.severity] || '●'}</span>
              <div className="ac-title">{a.title}</div>
              <RiskBadge level={a.severity} />
              {a.acknowledged && <span className="ac-acked-badge">RESOLVED</span>}
            </div>
            <div className="ac-message">{a.message}</div>
            <div className="ac-meta">
              {a.target && <span className="text-mono text-muted">Target: {a.target}</span>}
              {a.port && <span className="text-mono text-cyan">Port: {a.port}</span>}
              <span className="text-mono text-muted">{formatDate(a.createdAt)}</span>
            </div>
            <div className="ac-actions">
              {!a.acknowledged && (
                <button className="ac-btn-ack" onClick={() => handleAck(a._id)}>✓ Acknowledge</button>
              )}
              <button className="ac-btn-del" onClick={() => handleDelete(a._id)}>✕ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
