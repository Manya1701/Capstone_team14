import React, { useState, useEffect, useCallback } from 'react';
import RiskBadge from '../components/RiskBadge';
import { portAPI } from '../utils/api';
import { timeAgo } from '../utils/helpers';
import './Firewall.css';

export default function Firewall({ lastEvent }) {
  const [rules, setRules] = useState([]);
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState('tcp');
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    const res = await portAPI.getRules();
    setRules(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (lastEvent) load(); }, [lastEvent, load]);

  const handleBlock = async () => {
    if (!port) return;
    try {
      await portAPI.block(parseInt(port), protocol, reason || 'Manually blocked');
      showToast(`Port ${port} blocked`, 'warning');
      setPort(''); setReason('');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleAllow = async (p, proto) => {
    try {
      await portAPI.allow(p, proto);
      showToast(`Port ${p} allowed`, 'success');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const blocked = rules.filter(r => r.action === 'block');
  const allowed = rules.filter(r => r.action === 'allow');

  return (
    <div className="firewall animate-fadeIn">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Firewall Rules</h1>
          <p className="page-sub text-mono">Manage port-level access control via iptables</p>
        </div>
      </div>

      {/* Quick block form */}
      <div className="card mb-16">
        <div className="card-title">Block a Port</div>
        <div className="fw-form">
          <div className="form-group">
            <label>Port Number</label>
            <input type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="e.g. 23" min="1" max="65535" />
          </div>
          <div className="form-group">
            <label>Protocol</label>
            <select value={protocol} onChange={e => setProtocol(e.target.value)}>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Reason (optional)</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Insecure protocol" />
          </div>
          <button className="block-btn" onClick={handleBlock} disabled={!port}>🔒 Block Port</button>
        </div>
      </div>

      <div className="fw-grid">
        {/* Blocked ports */}
        <div className="card">
          <div className="card-title">🔒 Blocked Ports ({blocked.length})</div>
          {blocked.length === 0 ? (
            <div className="fw-empty">No ports currently blocked</div>
          ) : (
            <div className="rule-list">
              {blocked.map(r => (
                <div key={r._id} className="rule-item rule-item--blocked">
                  <div className="rule-port">{r.port}</div>
                  <div className="rule-info">
                    <span className="rule-service">{r.service}</span>
                    <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.protocol}</span>
                  </div>
                  <RiskBadge level={r.riskLevel} />
                  <div className="rule-meta">
                    {r.reason && <span className="rule-reason">{r.reason}</span>}
                    <span className="text-mono text-muted" style={{ fontSize: 10 }}>{timeAgo(r.blockedAt || r.updatedAt)}</span>
                  </div>
                  <button className="unblock-btn" onClick={() => handleAllow(r.port, r.protocol)}>✓ Allow</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allowed ports */}
        <div className="card">
          <div className="card-title">✓ Allowed Ports ({allowed.length})</div>
          {allowed.length === 0 ? (
            <div className="fw-empty">No explicit allow rules</div>
          ) : (
            <div className="rule-list">
              {allowed.map(r => (
                <div key={r._id} className="rule-item rule-item--allowed">
                  <div className="rule-port">{r.port}</div>
                  <div className="rule-info">
                    <span className="rule-service">{r.service}</span>
                    <span className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.protocol}</span>
                  </div>
                  <RiskBadge level={r.riskLevel} />
                  <button className="fw-block-btn" onClick={() => portAPI.block(r.port, r.protocol).then(load)}>Block</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Iptables info */}
      <div className="card mt-16 iptables-info">
        <div className="card-title">ℹ️ How Rules Work</div>
        <p className="text-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Blocking a port executes: <code>iptables -A INPUT -p tcp --dport PORT -j DROP</code><br />
          Allowing a port executes: <code>iptables -D INPUT -p tcp --dport PORT -j DROP</code><br />
          Rules are also persisted in MongoDB for tracking and audit purposes.<br />
          <span style={{ color: 'var(--accent-orange)' }}>⚠ Requires NET_ADMIN capability (provided by Docker config)</span>
        </p>
      </div>
    </div>
  );
}
