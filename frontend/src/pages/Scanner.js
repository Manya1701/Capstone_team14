import React, { useState, useEffect, useCallback } from 'react';
import PortTable from '../components/PortTable';
import { scanAPI, portAPI } from '../utils/api';
import { timeAgo } from '../utils/helpers';
import './Scanner.css';

export default function Scanner({ lastEvent }) {
  const [target, setTarget] = useState('127.0.0.1');
  const [portRange, setPortRange] = useState('1-1000');
  const [simulate, setSimulate] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState(null);
  const [scans, setScans] = useState([]);
  const [rules, setRules] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    const [scansRes, rulesRes] = await Promise.all([scanAPI.getAll(), portAPI.getRules()]);
    setScans(scansRes.data);
    setRules(rulesRes.data);
    if (!selectedScan && scansRes.data[0]) setSelectedScan(scansRes.data[0]);
  }, [selectedScan]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'scan:started') { setScanning(true); showToast('Scan started…', 'info'); }
    if (lastEvent.type === 'scan:completed') {
      setScanning(false);
      showToast(`Scan complete — ${lastEvent.data.openPorts} open ports found`, 'success');
      loadData();
    }
    if (lastEvent.type === 'scan:failed') { setScanning(false); showToast('Scan failed: ' + lastEvent.data.error, 'error'); }
    if (lastEvent.type === 'port:blocked' || lastEvent.type === 'port:allowed') loadData();
  }, [lastEvent, loadData]);

  const handleScan = async () => {
    if (scanning) return;
    setScanning(true);
    try {
      const res = await scanAPI.start({ target, portRange, simulate });
      setCurrentScan(res.data.scanId);
    } catch (err) {
      setScanning(false);
      showToast('Failed to start scan: ' + err.message, 'error');
    }
  };

  const handleBlock = async (port, protocol) => {
    try {
      await portAPI.block(port, protocol, 'Manually blocked via dashboard');
      showToast(`Port ${port} blocked`, 'warning');
      loadData();
    } catch (err) { showToast('Failed to block port', 'error'); }
  };

  const handleAllow = async (port, protocol) => {
    try {
      await portAPI.allow(port, protocol);
      showToast(`Port ${port} allowed`, 'success');
      loadData();
    } catch (err) { showToast('Failed to allow port', 'error'); }
  };

  const displayPorts = selectedScan?.ports || [];

  return (
    <div className="scanner animate-fadeIn">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Port Scanner</h1>
          <p className="page-sub text-mono">Scan targets with nmap & analyze results</p>
        </div>
      </div>

      {/* Scan control */}
      <div className="scan-panel card">
        <div className="card-title">Configure Scan</div>
        <div className="scan-form">
          <div className="form-group">
            <label>Target IP / Hostname</label>
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              disabled={scanning}
            />
          </div>
          <div className="form-group">
            <label>Port Range</label>
            <input
              value={portRange}
              onChange={e => setPortRange(e.target.value)}
              placeholder="e.g. 1-1000 or 22,80,443"
              disabled={scanning}
            />
          </div>
          <div className="form-group">
            <label>Mode</label>
            <div className="toggle-group">
              <button className={`toggle-btn ${!simulate ? 'active' : ''}`} onClick={() => setSimulate(false)} disabled={scanning}>
                Nmap (Real)
              </button>
              <button className={`toggle-btn ${simulate ? 'active' : ''}`} onClick={() => setSimulate(true)} disabled={scanning}>
                Simulate
              </button>
            </div>
            {simulate && <div className="form-hint">⚡ Simulated mode uses demo data — no nmap required</div>}
          </div>
          <button className={`scan-btn ${scanning ? 'scanning' : ''}`} onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <><span className="spin">◈</span> Scanning…</>
            ) : '▶ Start Scan'}
          </button>
        </div>

        {scanning && (
          <div className="scan-progress">
            <div className="scan-bar"><div className="scan-fill" /></div>
            <span className="text-mono text-muted">Scanning {target}:{portRange}…</span>
          </div>
        )}
      </div>

      {/* Scan history selector */}
      {scans.length > 0 && (
        <div className="card mt-16">
          <div className="card-title">Scan History — Select to View</div>
          <div className="scan-history">
            {scans.slice(0, 8).map(s => (
              <button
                key={s._id}
                className={`hist-btn ${selectedScan?._id === s._id ? 'active' : ''}`}
                onClick={() => setSelectedScan(s)}
              >
                <span className="text-mono text-cyan">{s.target}</span>
                <span className={`scan-status-dot ${s.status}`} />
                <span>{s.openPortsCount} open</span>
                <span className="text-muted">{timeAgo(s.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Port table */}
      {displayPorts.length > 0 && (
        <div className="mt-16">
          <div className="table-header-row">
            <span className="card-title" style={{ marginBottom: 0 }}>
              Results: <span className="text-cyan text-mono">{selectedScan?.target}</span>
              &nbsp;— {selectedScan?.openPortsCount} open ports,&nbsp;
              <span className="text-red">{selectedScan?.highRiskCount} high risk</span>
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <PortTable ports={displayPorts} rules={rules} onBlock={handleBlock} onAllow={handleAllow} />
          </div>
        </div>
      )}

      {scans.length === 0 && !scanning && (
        <div className="scan-empty card">
          <div className="scan-empty-icon">◈</div>
          <div>No scans yet. Configure and run your first scan above.</div>
        </div>
      )}
    </div>
  );
}
