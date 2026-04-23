import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Firewall from './pages/Firewall';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import { useSocket } from './hooks/useSocket';
import './App.css';

export default function App() {
  const { connected, lastEvent } = useSocket();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar connected={connected} unreadAlerts={unreadAlerts} />
        <main className="app-main">
          <Routes>
            <Route path="/"         element={<Dashboard lastEvent={lastEvent} />} />
            <Route path="/scan"     element={<Scanner lastEvent={lastEvent} />} />
            <Route path="/firewall" element={<Firewall lastEvent={lastEvent} />} />
            <Route path="/alerts"   element={<Alerts lastEvent={lastEvent} onAlertsChange={setUnreadAlerts} />} />
            <Route path="/logs"     element={<Logs lastEvent={lastEvent} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
