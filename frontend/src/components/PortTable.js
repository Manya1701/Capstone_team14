import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import './PortTable.css';

export default function PortTable({ ports = [], onBlock, onAllow, rules = [] }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const blockedPorts = new Set(rules.filter(r => r.action === 'block').map(r => r.port));

  const filtered = ports.filter(p => {
    if (filter === 'open' && p.state !== 'open') return false;
    if (filter === 'high' && p.riskLevel !== 'high' && p.riskLevel !== 'critical') return false;
    if (filter === 'blocked' && !blockedPorts.has(p.port)) return false;
    if (search && !String(p.port).includes(search) && !p.service.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="port-table-wrap">
      <div className="pt-toolbar">
        <input
          className="pt-search"
          placeholder="Search port or service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="pt-filters">
          {['all','open','high','blocked'].map(f => (
            <button key={f} className={`pt-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-scroll">
        <table className="port-table">
          <thead>
            <tr>
              <th>PORT</th>
              <th>PROTO</th>
              <th>STATE</th>
              <th>SERVICE</th>
              <th>RISK</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="pt-empty">No ports match filter</td></tr>
            ) : filtered.map((p, i) => {
              const isBlocked = blockedPorts.has(p.port);
              return (
                <tr key={i} className={`pt-row ${p.riskLevel === 'critical' ? 'row-critical' : ''}`}>
                  <td className="pt-port">{p.port}</td>
                  <td className="pt-proto">{p.protocol || 'tcp'}</td>
                  <td>
                    <span className={`pt-state ${p.state}`}>{p.state}</span>
                  </td>
                  <td className="pt-service">{p.service}</td>
                  <td><RiskBadge level={p.riskLevel} /></td>
                  <td>
                    <span className={`pt-blocked-badge ${isBlocked ? 'blocked' : 'allowed'}`}>
                      {isBlocked ? '🔒 BLOCKED' : '✓ OPEN'}
                    </span>
                  </td>
                  <td>
                    {isBlocked ? (
                      <button className="btn-allow" onClick={() => onAllow(p.port, p.protocol)}>Allow</button>
                    ) : (
                      <button className="btn-block" onClick={() => onBlock(p.port, p.protocol)}>Block</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pt-footer">Showing {filtered.length} of {ports.length} ports</div>
    </div>
  );
}
