import React, { useState, useEffect, useCallback } from 'react';
import { logAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import './Logs.css';

const SEV_COLORS = { info: 'var(--accent-cyan)', warning: 'var(--accent-orange)', error: 'var(--accent-red)', critical: 'var(--accent-red)' };
const ACTION_ICONS = {
  scan_started: '▶',
  scan_completed: '✓',
  port_blocked: '🔒',
  port_allowed: '✓',
  alert_triggered: '⚠',
  system: '⬡',
};

export default function Logs({ lastEvent }) {
  const [logs, setLogs] = useState([]);
  const [severity, setSeverity] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (severity) params.severity = severity;
      if (action) params.action = action;
      const res = await logAPI.getAll(params);
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  }, [severity, action]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (lastEvent) load(); }, [lastEvent, load]);

  const handleClear = async () => {
    if (!window.confirm('Clear all logs?')) return;
    await logAPI.clear();
    showToast('Logs cleared', 'warning');
    load();
  };

  return (
    <div className="logs-page animate-fadeIn">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-sub text-mono">Full audit trail of all system actions</p>
        </div>
        <button className="clear-btn" onClick={handleClear}>✕ Clear Logs</button>
      </div>

      {/* Filters */}
      <div className="log-toolbar card mb-16">
        <div className="filter-group">
          <label>Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Action</label>
          <select value={action} onChange={e => setAction(e.target.value)}>
            <option value="">All</option>
            <option value="scan_started">Scan Started</option>
            <option value="scan_completed">Scan Completed</option>
            <option value="port_blocked">Port Blocked</option>
            <option value="port_allowed">Port Allowed</option>
            <option value="alert_triggered">Alert Triggered</option>
          </select>
        </div>
        <div className="log-count text-mono text-muted">{logs.length} entries</div>
      </div>

      {/* Log entries */}
      <div className="log-terminal card">
        <div className="terminal-header">
          <span className="t-dot red" /><span className="t-dot yellow" /><span className="t-dot green" />
          <span className="terminal-title text-mono">system.log</span>
        </div>
        <div className="terminal-body">
          {loading ? (
            <div className="log-loading text-mono text-muted">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="log-loading text-mono text-muted">No log entries found.</div>
          ) : logs.map((log, i) => (
            <div key={log._id} className="log-line animate-slideIn" style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}>
              <span className="ll-time text-mono">[{formatDate(log.createdAt)}]</span>
              <span className="ll-sev" style={{ color: SEV_COLORS[log.severity] || 'var(--accent-cyan)' }}>
                [{log.severity.toUpperCase()}]
              </span>
              <span className="ll-action">{ACTION_ICONS[log.action] || '•'}</span>
              <span className="ll-msg">{log.message}</span>
              {log.port && <span className="ll-port text-mono text-cyan">:{log.port}</span>}
              {log.target && <span className="ll-target text-mono text-muted">@{log.target}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
