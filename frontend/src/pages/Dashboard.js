import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { scanAPI, alertAPI, logAPI } from '../utils/api';
import { timeAgo } from '../utils/helpers';
import './Dashboard.css';

const RISK_COLORS = { low: '#00ff88', medium: '#ffd60a', high: '#ff9500', critical: '#ff3860' };

export default function Dashboard({ lastEvent }) {
  const [stats, setStats] = useState({ scans: 0, openPorts: 0, highRisk: 0, alerts: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [scansRes, alertsRes, logsRes] = await Promise.all([
        scanAPI.getAll(),
        alertAPI.getAll({ acknowledged: false }),
        logAPI.getAll({ limit: 8 }),
      ]);

      const scans = scansRes.data;
      const alerts = alertsRes.data;
      const logs = logsRes.data;

      setRecentScans(scans.slice(0, 5));
      setRecentAlerts(alerts.slice(0, 5));
      setRecentLogs(logs);

      const totalOpen = scans.reduce((s, sc) => s + (sc.openPortsCount || 0), 0);
      const totalHigh = scans.reduce((s, sc) => s + (sc.highRiskCount || 0), 0);

      setStats({
        scans: scans.length,
        openPorts: totalOpen,
        highRisk: totalHigh,
        alerts: alerts.length,
      });

      // Build risk distribution from latest scan
      if (scans[0]?.ports?.length) {
        const dist = { low: 0, medium: 0, high: 0, critical: 0 };
        scans[0].ports.filter(p => p.state === 'open').forEach(p => { dist[p.riskLevel] = (dist[p.riskLevel] || 0) + 1; });
        setRiskData(Object.entries(dist).map(([name, value]) => ({ name, value })));
      }
    } catch (err) {
      console.error('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (lastEvent) loadData();
  }, [lastEvent, loadData]);

  const radarData = [
    { subject: 'Open Ports', A: Math.min(stats.openPorts, 100) },
    { subject: 'High Risk', A: Math.min(stats.highRisk * 10, 100) },
    { subject: 'Alerts', A: Math.min(stats.alerts * 15, 100) },
    { subject: 'Scans', A: Math.min(stats.scans * 5, 100) },
    { subject: 'Critical', A: Math.min((riskData.find(r => r.name === 'critical')?.value || 0) * 20, 100) },
  ];

  return (
    <div className="dashboard animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Security Overview</h1>
          <p className="page-sub text-mono">Real-time network security dashboard</p>
        </div>
        <Link to="/scan" className="btn-primary">+ New Scan</Link>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard label="Total Scans" value={stats.scans} icon="◈" color="cyan" sub="All time" />
        <StatCard label="Open Ports" value={stats.openPorts} icon="⬡" color="green" sub="Across all scans" />
        <StatCard label="High Risk Ports" value={stats.highRisk} icon="⚠" color="orange" sub="Needs attention" />
        <StatCard label="Active Alerts" value={stats.alerts} icon="◉" color="red" sub="Unacknowledged" />
      </div>

      <div className="dash-grid">
        {/* Radar chart */}
        <div className="card">
          <div className="card-title">Threat Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a2a4a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b8cad', fontSize: 11, fontFamily: 'Share Tech Mono' }} />
              <Radar dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk bar chart */}
        <div className="card">
          <div className="card-title">Risk Distribution</div>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskData} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: '#6b8cad', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1a2a4a', borderRadius: 6, fontFamily: 'Share Tech Mono', fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={RISK_COLORS[entry.name] || '#00d4ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dash-empty">Run a scan to see risk distribution</div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-title-row">
            <span className="card-title">Recent Alerts</span>
            <Link to="/alerts" className="card-link">View all →</Link>
          </div>
          <div className="alert-list">
            {recentAlerts.length === 0 ? (
              <div className="dash-empty">No active alerts 🟢</div>
            ) : recentAlerts.map(a => (
              <div key={a._id} className="alert-item">
                <RiskBadge level={a.severity} />
                <div className="alert-msg">{a.title}</div>
                <div className="alert-time text-mono">{timeAgo(a.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="card">
          <div className="card-title-row">
            <span className="card-title">Activity Log</span>
            <Link to="/logs" className="card-link">View all →</Link>
          </div>
          <div className="log-list">
            {recentLogs.length === 0 ? (
              <div className="dash-empty">No activity yet</div>
            ) : recentLogs.map(l => (
              <div key={l._id} className="log-item">
                <span className={`log-sev log-sev--${l.severity}`}>●</span>
                <span className="log-msg">{l.message}</span>
                <span className="log-time text-mono">{timeAgo(l.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent scans table */}
      {recentScans.length > 0 && (
        <div className="card mt-16">
          <div className="card-title-row">
            <span className="card-title">Recent Scans</span>
            <Link to="/scan" className="card-link">New scan →</Link>
          </div>
          <table className="mini-table">
            <thead>
              <tr><th>TARGET</th><th>STATUS</th><th>OPEN</th><th>HIGH RISK</th><th>TIME</th></tr>
            </thead>
            <tbody>
              {recentScans.map(s => (
                <tr key={s._id}>
                  <td className="text-mono text-cyan">{s.target}</td>
                  <td><span className={`scan-status ${s.status}`}>{s.status}</span></td>
                  <td className="text-mono">{s.openPortsCount}</td>
                  <td className="text-mono" style={{ color: s.highRiskCount > 0 ? 'var(--accent-red)' : 'inherit' }}>{s.highRiskCount}</td>
                  <td className="text-mono text-muted">{timeAgo(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
