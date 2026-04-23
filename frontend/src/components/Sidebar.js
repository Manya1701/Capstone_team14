import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/scan', label: 'Port Scanner', icon: '◈' },
  { to: '/firewall', label: 'Firewall', icon: '⬢' },
  { to: '/alerts', label: 'Alerts', icon: '◉' },
  { to: '/logs', label: 'Logs', icon: '≡' },
];

export default function Sidebar({ connected, unreadAlerts }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⬡</span>
        <div>
          <div className="logo-title">PORT<span>SEC</span></div>
          <div className="logo-sub">Security Monitor</div>
        </div>
      </div>

      <div className="sidebar-status">
        <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
        <span>{connected ? 'LIVE' : 'OFFLINE'}</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.label === 'Alerts' && unreadAlerts > 0 && (
              <span className="nav-badge">{unreadAlerts}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="text-muted text-mono" style={{ fontSize: '11px' }}>
          v1.0.0 · MERN + Docker
        </div>
      </div>
    </aside>
  );
}
