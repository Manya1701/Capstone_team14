# Port Security Monitoring & Access Control System

A comprehensive full-stack cybersecurity dashboard built with the MERN stack (MongoDB, Express, React, Node.js) and Docker. This system provides real-time port scanning, firewall management, security alert detection, and comprehensive audit logging capabilities.
## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Real-time Events](#-real-time-events)
- [Technology Stack](#-technology-stack)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)

## Overview
The Port Security Monitoring & Access Control System is an enterprise-grade security tool that helps network administrators:

- **Monitor** network ports in real-time using Nmap integration
- **Detect** potential security vulnerabilities through automated risk assessment
- **Control** network access via iptables firewall rules
- **Track** all security events with comprehensive audit logging
- **Alert** administrators of high-risk open ports automatically
- **Visualize** security posture through interactive dashboards

### Key Highlights

- **Automated Port Scanning** - Leverages Nmap for comprehensive port discovery
- **Risk Classification** - Pre-configured database of 50+ known risky ports
- **Firewall Integration** - Direct iptables control for port blocking/allowing
- **Real-time Updates** - Socket.io powered live notifications
- **Visual Analytics** - Interactive charts and dashboards
- **Modern UI** - Cyberpunk-themed responsive interface
- **Containerized** - Complete Docker deployment for easy setup

## Features

### 1. Port Scanner
- **Nmap Integration**: Utilizes industry-standard Nmap for accurate port scanning
- **Customizable Scans**: Define target IP/hostname and port ranges
- **Simulated Mode**: Demo mode for testing without actual network scanning
- **Real-time Results**: Live updates via WebSocket connections
- **Historical Data**: All scan results stored in MongoDB for analysis

### 2. Risk Detection Engine
- **Automated Classification**: Ports automatically rated as Low, Medium, High, or Critical
- **Risk Database**: 50+ pre-configured known risky ports and services
- **Severity Levels**:
  - 🔴 **Critical**: Telnet (23), SMB (445), RDP (3389), VNC (5900), Redis (6379), MongoDB (27017)
  - 🟠 **High**: FTP (21), MS-SQL (1433), MySQL (3306), RSH (514)
  - 🟡 **Medium**: SSH (22), HTTP (80), SMTP (25), DNS (53)
  - 🟢 **Low**: HTTPS (443), SMTP TLS (587), IMAPS (993)

### 3. Firewall Management
- **iptables Control**: Block/unblock ports directly from the UI
- **Rule Persistence**: All firewall rules stored in database
- **Quick Actions**: One-click port blocking for high-risk services
- **Status Tracking**: View current firewall configuration
- **Audit Trail**: All firewall changes logged

### 4. Security Alerts
- **Automatic Generation**: Alerts created for high-risk open ports
- **Real-time Notifications**: Instant Socket.io alerts to dashboard
- **Alert Management**: Acknowledge or dismiss alerts
- **Severity Filtering**: Filter by alert priority
- **Historical View**: Track all security incidents

### 5. Audit Logging
- **Comprehensive Tracking**: Every action logged with timestamp
- **Terminal Interface**: Hacker-style log viewer
- **Severity Levels**: INFO, WARNING, ERROR categorization
- **Search & Filter**: Find specific events quickly
- **Export Capability**: Audit logs for compliance reporting

### 6. Interactive Dashboard
- **KPI Cards**: Quick stats on total ports scanned, open ports, high-risk ports
- **Radar Chart**: Visual representation of open ports by type
- **Risk Distribution**: Bar chart showing port counts by risk level
- **Recent Activity**: Latest scans and alerts at a glance
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Frontend (Port 3000)                         │    │
│  │  - Dashboard, Scanner, Firewall, Alerts, Logs       │    │
│  │  - Recharts for visualizations                      │    │
│  │  - Socket.io-client for real-time updates           │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP/WebSocket
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Node.js + Express (Port 5000)                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                │    │
│  │  │  REST API    │  │  Socket.io   │                │    │
│  │  │  Endpoints   │  │  Events      │                │    │
│  │  └──────────────┘  └──────────────┘                │    │
│  │                                                      │    │
│  │  Controllers:                                        │    │
│  │  ├─ scanController  (Nmap operations)               │    │
│  │  ├─ portController  (iptables management)           │    │
│  │  ├─ alertController (Security alerts)               │    │
│  │  └─ logController   (Audit logging)                 │    │
│  └────────────────────────────────────────────────────┘    │
└───────┬──────────────────────────┬──────────────────────────┘
        │                          │
        │ Mongoose ODM             │ System Calls
        ▼                          ▼
┌───────────────────┐    ┌─────────────────────┐
│   MongoDB         │    │  System Tools       │
│   (Port 27017)    │    │  - nmap             │
│                   │    │  - iptables         │
│  Collections:     │    │                     │
│  - scanresults    │    └─────────────────────┘
│  - portrules      │
│  - alerts         │
│  - logs           │
└───────────────────┘
```

### Data Flow

1. **Scan Initiation**: User triggers scan from Scanner page
2. **Backend Processing**: Express controller spawns Nmap process
3. **Real-time Updates**: Socket.io emits `scan:started` event
4. **Result Parsing**: Nmap output parsed and analyzed
5. **Risk Assessment**: Each port checked against risk database
6. **Alert Generation**: High-risk ports trigger automatic alerts
7. **Database Storage**: Results saved to MongoDB
8. **Client Update**: Socket.io emits `scan:completed` with results
9. **Dashboard Refresh**: React components re-render with new data

---

## Project Structure

```
port-security/
├── docker-compose.yml              # Container orchestration
├── README.md                       # This file
│
├── backend/                        # Node.js backend
│   ├── Dockerfile                  # Backend container config
│   ├── package.json                # Backend dependencies
│   ├── server.js                   # Express + Socket.io entry point
│   │
│   ├── controllers/                # Business logic
│   │   ├── scanController.js       # Nmap scan operations
│   │   ├── portController.js       # iptables firewall control
│   │   ├── logController.js        # Audit log management
│   │   └── alertController.js      # Security alert handling
│   │
│   ├── models/                     # MongoDB schemas
│   │   ├── ScanResult.js           # Port scan result model
│   │   ├── PortRule.js             # Firewall rule model
│   │   ├── Log.js                  # Audit log model
│   │   └── Alert.js                # Security alert model
│   │
│   ├── routes/                     # API endpoints
│   │   ├── scanRoutes.js           # /api/scan routes
│   │   ├── portRoutes.js           # /api/ports routes
│   │   ├── logRoutes.js            # /api/logs routes
│   │   └── alertRoutes.js          # /api/alerts routes
│   │
│   └── middleware/
│       └── portRiskDb.js           # Risk classification database
│
└── frontend/                       # React frontend
    ├── Dockerfile                  # Frontend container config
    ├── nginx.conf                  # Nginx configuration
    ├── package.json                # Frontend dependencies
    │
    ├── public/
    │   └── index.html              # HTML template
    │
    └── src/
        ├── index.js                # React entry point
        ├── App.js                  # Main app component
        ├── App.css                 # Global styles
        │
        ├── components/             # Reusable components
        │   ├── Sidebar.js          # Navigation sidebar
        │   ├── StatCard.js         # KPI stat cards
        │   ├── RiskBadge.js        # Risk level badges
        │   └── PortTable.js        # Sortable port table
        │
        ├── pages/                  # Page components
        │   ├── Dashboard.js        # Main dashboard with charts
        │   ├── Scanner.js          # Port scanning interface
        │   ├── Firewall.js         # Firewall rule management
        │   ├── Alerts.js           # Security alerts view
        │   └── Logs.js             # Audit log terminal
        │
        ├── hooks/
        │   └── useSocket.js        # Socket.io custom hook
        │
        └── utils/
            ├── api.js              # Axios API client
            └── helpers.js          # Utility functions
```

---

## Prerequisites

### For Docker Deployment (Recommended)
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Operating System**: Linux (preferred), macOS, or Windows with WSL2

### For Local Development
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **MongoDB**: Version 6.x or higher
- **Nmap**: Latest version
  - Ubuntu/Debian: `sudo apt install nmap`
  - macOS: `brew install nmap`
  - Windows: Download from https://nmap.org/download
- **iptables**: Pre-installed on most Linux systems

---

## Installation & Setup

### Option 1: Docker Deployment (Recommended)

This is the easiest and most reliable way to run the application.

```bash
# 1. Navigate to project directory
cd port-security

# 2. Build and start all containers
docker-compose up --build

# 3. Access the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000/api/health
# MongoDB:   localhost:27017

# 4. To run in detached mode
docker-compose up -d

# 5. View logs
docker-compose logs -f

# 6. Stop all containers
docker-compose down

# 7. Stop and remove volumes (clean slate)
docker-compose down -v
```

### Option 2: Local Development

For development or if you prefer running services separately:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/port_security
PORT=5000
NODE_ENV=development
EOF

# Install system dependencies
# Ubuntu/Debian:
sudo apt install nmap

# macOS:
brew install nmap

# Start the backend server
npm run dev

# Or for production:
npm start
```

#### Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start

# The app will open at http://localhost:3000
```

#### MongoDB Setup

```bash
# Option 1: Docker
docker run -d -p 27017:27017 --name mongo-psm mongo:6

# Option 2: Local installation
# Ubuntu/Debian:
sudo apt install mongodb-org
sudo systemctl start mongod

# macOS:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## Usage Guide

### 1. Dashboard Overview

The dashboard provides a comprehensive view of your network security status:

- **Total Scans**: Number of scans performed
- **Open Ports**: Currently open ports across all scans
- **High Risk Ports**: Ports classified as high or critical risk
- **Radar Chart**: Visual distribution of open ports
- **Risk Distribution**: Bar chart showing port counts by risk level

### 2. Running a Port Scan

1. Navigate to the **Scanner** page
2. Enter target details:
   - **Target**: IP address or hostname (e.g., `192.168.1.1` or `scanme.nmap.org`)
   - **Port Range**: e.g., `1-1000`, `80,443,8080`, or `1-65535` for full scan
   - **Simulate**: Toggle ON for demo mode (no actual scanning)
3. Click **Start Scan**
4. Watch real-time progress
5. View results in the port table with risk classifications

### 3. Managing Firewall Rules

1. Navigate to the **Firewall** page
2. View current firewall rules and port status
3. To block a port:
   - Find the port in the list
   - Click **Block Port**
   - Confirm the action
4. To unblock a port:
   - Find the blocked port
   - Click **Allow Port**
   - Confirm the action

### 4. Viewing Security Alerts

1. Navigate to the **Alerts** page
2. View all security alerts sorted by severity
3. Alert actions:
   - **Acknowledge**: Mark alert as reviewed
   - **Acknowledge All**: Mark all alerts as reviewed
   - **Delete**: Remove specific alerts
4. Alerts are color-coded:
   - Red: Critical
   - Orange: High
   - Yellow: Medium
   - Green: Low

### 5. Audit Log Review

1. Navigate to the **Logs** page
2. Terminal-style interface shows all system activities
3. Filter logs by severity level
4. Search for specific events
5. Export logs for compliance reporting

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Scan Endpoints

**POST /api/scan** - Start a new port scan
```json
Request:
{
  "target": "192.168.1.1",
  "portRange": "1-1000",
  "simulate": false
}

Response:
{
  "_id": "...",
  "target": "192.168.1.1",
  "portRange": "1-1000",
  "status": "in_progress",
  "startTime": "2024-04-22T10:00:00Z"
}
```

**GET /api/scan** - Get all scan results
```json
Response:
[
  {
    "_id": "...",
    "target": "192.168.1.1",
    "openPorts": 5,
    "highRiskCount": 2,
    "status": "completed",
    "ports": [...],
    "timestamp": "2024-04-22T10:00:00Z"
  }
]
```

**GET /api/scan/:id** - Get specific scan result
```json
Response:
{
  "_id": "...",
  "target": "192.168.1.1",
  "portRange": "1-1000",
  "openPorts": 5,
  "highRiskCount": 2,
  "ports": [
    {
      "port": 22,
      "protocol": "tcp",
      "service": "ssh",
      "state": "open",
      "riskLevel": "medium"
    }
  ]
}
```

#### Firewall Endpoints

**POST /api/ports/block** - Block a port
```json
Request:
{
  "port": 23,
  "protocol": "tcp",
  "reason": "Insecure telnet service"
}

Response:
{
  "success": true,
  "message": "Port 23 blocked successfully",
  "rule": {...}
}
```

**POST /api/ports/allow** - Allow/unblock a port
```json
Request:
{
  "port": 23,
  "protocol": "tcp"
}

Response:
{
  "success": true,
  "message": "Port 23 allowed successfully"
}
```

**GET /api/ports/rules** - Get all firewall rules
```json
Response:
[
  {
    "port": 23,
    "protocol": "tcp",
    "action": "BLOCK",
    "reason": "Insecure telnet service",
    "createdAt": "2024-04-22T10:00:00Z"
  }
]
```

**GET /api/ports/status/:port** - Get port status
```json
Response:
{
  "port": 23,
  "blocked": true,
  "rule": {...}
}
```

#### Alert Endpoints

**GET /api/alerts** - Get all alerts
```json
Response:
[
  {
    "_id": "...",
    "type": "high_risk_port",
    "severity": "critical",
    "message": "Critical risk port detected: 23 (telnet)",
    "acknowledged": false,
    "timestamp": "2024-04-22T10:00:00Z"
  }
]
```

**PUT /api/alerts/:id/acknowledge** - Acknowledge an alert
```json
Response:
{
  "success": true,
  "alert": {...}
}
```

**PUT /api/alerts/acknowledge-all** - Acknowledge all alerts
```json
Response:
{
  "success": true,
  "count": 5
}
```

**DELETE /api/alerts/:id** - Delete an alert
```json
Response:
{
  "success": true,
  "message": "Alert deleted"
}
```

#### Log Endpoints

**GET /api/logs** - Get audit logs
```json
Query Parameters:
- severity: "INFO" | "WARNING" | "ERROR"
- limit: number (default: 100)

Response:
[
  {
    "action": "PORT_SCAN_STARTED",
    "details": "Scanning 192.168.1.1 ports 1-1000",
    "severity": "INFO",
    "timestamp": "2024-04-22T10:00:00Z"
  }
]
```

**DELETE /api/logs** - Clear all logs
```json
Response:
{
  "success": true,
  "message": "All logs cleared"
}
```

---

## Real-time Events (Socket.io)

The application uses Socket.io for real-time bidirectional communication.

### Client Connection
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');
```

### Events

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `connection` | Server → Client | `{ socketId }` | Client connected |
| `disconnect` | Server → Client | - | Client disconnected |
| `scan:started` | Server → Client | `{ scanId, target }` | Scan initiated |
| `scan:progress` | Server → Client | `{ scanId, progress }` | Scan progress update |
| `scan:completed` | Server → Client | `{ scanId, openPorts, highRisk, ports }` | Scan finished |
| `scan:failed` | Server → Client | `{ scanId, error }` | Scan error |
| `alert:new` | Server → Client | `{ alert }` | New security alert |
| `port:blocked` | Server → Client | `{ port, protocol, service }` | Port blocked |
| `port:allowed` | Server → Client | `{ port, protocol, service }` | Port unblocked |

### Example Usage

```javascript
// Listen for scan completion
socket.on('scan:completed', (data) => {
  console.log('Scan completed:', data);
  // Update UI with scan results
});

// Listen for new alerts
socket.on('alert:new', (alert) => {
  console.log('New alert:', alert);
  // Show notification
});
```

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router DOM 6** - Client-side routing
- **Recharts** - Chart visualizations (Radar, Bar charts)
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **CSS3** - Styling (Cyberpunk theme)

### Backend
- **Node.js 18** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **Mongoose** - MongoDB ODM
- **Nmap** - Port scanning (via child_process)
- **iptables** - Firewall management (via child_process)

### Database
- **MongoDB 6** - NoSQL database for storing scans, rules, alerts, and logs

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **Alpine Linux** - Lightweight container base images

### Security Tools
- **Nmap** - Network port scanner
- **iptables** - Linux firewall utility

---

## Security Considerations

### Important Notes

1. **Privileged Operations**: The backend container requires `NET_ADMIN` and `NET_RAW` capabilities to run nmap and iptables. This is configured in `docker-compose.yml`.

2. **Simulated Mode**: For demo purposes without actual network scanning, set `simulate: true` in scan requests. This generates realistic demo data.

3. **iptables Persistence**: Firewall rules created via the app are stored in MongoDB but may not persist across system reboots unless configured separately.

4. **Network Isolation**: The application runs in an isolated Docker network. Firewall rules affect the container's network, not the host system.

5. **Authentication**: This demo version does not include authentication. For production use, implement proper authentication and authorization.

### Production Deployment Recommendations

- Add user authentication (JWT, OAuth)
- Implement role-based access control (RBAC)
- Use HTTPS/TLS for all communications
- Set up proper MongoDB authentication
- Configure iptables rules to persist across reboots
- Implement rate limiting on API endpoints
- Add comprehensive input validation
- Set up monitoring and alerting (Prometheus, Grafana)
- Regular security audits and penetration testing

---

## Troubleshooting

### Common Issues

#### 1. Docker containers won't start
```bash
# Check Docker service
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check logs
docker-compose logs
```

#### 2. MongoDB connection failed
```bash
# Check MongoDB container
docker ps | grep mongo

# View MongoDB logs
docker logs psm_mongo

# Restart MongoDB
docker-compose restart mongodb
```

#### 3. Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check CORS settings in `backend/server.js`
- Ensure ports 3000 and 5000 are not blocked by firewall

#### 4. Nmap scans failing
```bash
# Check if nmap is installed in container
docker exec psm_backend nmap --version

# Check container capabilities
docker inspect psm_backend | grep -A 10 CapAdd
```

#### 5. Port blocking not working
- Ensure backend container has NET_ADMIN capability
- Check iptables rules: `docker exec psm_backend iptables -L`
- Use simulated mode for demo purposes

#### 6. Real-time updates not working
- Check browser console for WebSocket errors
- Verify Socket.io connection: Look for "Client connected" in backend logs
- Check if port 5000 allows WebSocket connections

### Debug Commands

```bash
# View all container logs
docker-compose logs -f

# Access backend container shell
docker exec -it psm_backend sh

# Access MongoDB shell
docker exec -it psm_mongo mongosh

# Check running containers
docker ps

# Restart all services
docker-compose restart

# Clean rebuild
docker-compose down -v
docker-compose up --build
```

---

## Development Notes

### Adding New Features

1. **New API Endpoint**:
   - Create route in `backend/routes/`
   - Create controller in `backend/controllers/`
   - Add model if needed in `backend/models/`
   - Register route in `backend/server.js`

2. **New Frontend Page**:
   - Create component in `frontend/src/pages/`
   - Add route in `frontend/src/App.js`
   - Add navigation link in `frontend/src/components/Sidebar.js`

3. **New Socket Event**:
   - Emit from backend controller
   - Listen in `frontend/src/hooks/useSocket.js`
   - Handle in appropriate React component

### Code Style

- Use ES6+ features
- Follow functional programming patterns in React
- Use async/await for asynchronous operations
- Add comments for complex logic
- Use meaningful variable names

## Authors

- Nehal Jaswal
- Prashant Bhunal
- Manya Gupta
- Suraj Janghu
