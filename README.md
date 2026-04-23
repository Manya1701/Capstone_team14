#  Port Security Monitoring & Access Control System

A full-stack MERN + Docker cybersecurity dashboard for real-time port scanning, firewall management, alert detection, and audit logging.

---

##  Project Structure

```
port-security/
├── docker-compose.yml          # Orchestrates all containers
├── backend/
│   ├── Dockerfile
│   ├── server.js               # Express + Socket.io entry
│   ├── .env                    # Env variables
│   ├── models/
│   │   ├── ScanResult.js       # Port scan results
│   │   ├── PortRule.js         # Firewall rules
│   │   ├── Log.js              # Audit logs
│   │   └── Alert.js            # Security alerts
│   ├── controllers/
│   │   ├── scanController.js   # Nmap scan logic
│   │   ├── portController.js   # iptables block/allow
│   │   ├── logController.js
│   │   └── alertController.js
│   ├── routes/
│   │   ├── scanRoutes.js
│   │   ├── portRoutes.js
│   │   ├── logRoutes.js
│   │   └── alertRoutes.js
│   └── middleware/
│       └── portRiskDb.js       # 50+ known risky ports database
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── public/index.html
    └── src/
        ├── App.js / App.css
        ├── index.js / index.css
        ├── components/
        │   ├── Sidebar.js      # Navigation
        │   ├── StatCard.js     # KPI cards
        │   ├── RiskBadge.js    # Risk level pill
        │   └── PortTable.js    # Sortable/filterable port list
        ├── pages/
        │   ├── Dashboard.js    # Overview with charts
        │   ├── Scanner.js      # Scan control + results
        │   ├── Firewall.js     # Block/allow rules
        │   ├── Alerts.js       # Security alerts
        │   └── Logs.js         # Terminal-style audit log
        ├── hooks/
        │   └── useSocket.js    # Real-time Socket.io hook
        └── utils/
            ├── api.js          # Axios API client
            └── helpers.js      # Formatting utilities
```

---

##  Quick Start

### Option 1 — Docker (Recommended)

```bash
# Clone / extract the project
cd port-security

# Build and start all containers
docker-compose up --build

# Open browser
# Frontend  → http://localhost:3000
# Backend   → http://localhost:5000/api/health
```

### Option 2 — Local Development

**Backend:**
```bash
cd backend
npm install
# Install nmap on your system:
#   Ubuntu/Debian: sudo apt install nmap
#   macOS:         brew install nmap
#   Windows:       https://nmap.org/download
cp .env.example .env   # edit MONGO_URI if needed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**MongoDB:**
```bash
# Run MongoDB locally or via Docker
docker run -d -p 27017:27017 mongo:6
```

---

## 🔌 API Reference

### Scan
| Method | Endpoint         | Description              |
|--------|-----------------|--------------------------|
| POST   | /api/scan        | Start a port scan        |
| GET    | /api/scan        | Get all scan results     |
| GET    | /api/scan/:id    | Get single scan result   |

**POST /api/scan body:**
```json
{
  "target": "192.168.1.1",
  "portRange": "1-1000",
  "simulate": false
}
```

### Ports / Firewall
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/ports/block      | Block a port via iptables|
| POST   | /api/ports/allow      | Allow/unblock a port     |
| GET    | /api/ports/rules      | Get all firewall rules   |
| GET    | /api/ports/status/:port | Get port status        |

### Logs
| Method | Endpoint    | Description        |
|--------|------------|---------------------|
| GET    | /api/logs   | Get audit logs     |
| DELETE | /api/logs   | Clear all logs     |

### Alerts
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/alerts                 | Get alerts               |
| PUT    | /api/alerts/:id/acknowledge | Acknowledge single alert |
| PUT    | /api/alerts/acknowledge-all | Acknowledge all          |
| DELETE | /api/alerts/:id             | Delete alert             |

---

##  Real-time Events (Socket.io)

| Event             | Payload                              |
|-------------------|--------------------------------------|
| `scan:started`    | `{ scanId, target }`                 |
| `scan:completed`  | `{ scanId, openPorts, highRisk, ports }` |
| `scan:failed`     | `{ scanId, error }`                  |
| `alert:new`       | Alert object                         |
| `port:blocked`    | `{ port, protocol, service }`        |
| `port:allowed`    | `{ port, protocol, service }`        |

---

##  Risk Database

The system has 50+ known ports pre-classified:

| Risk Level | Examples                              |
|-----------|----------------------------------------|
|  Critical | 23 (Telnet), 445 (SMB), 3389 (RDP), 5900 (VNC), 6379 (Redis), 27017 (MongoDB) |
|  High    | 21 (FTP), 1433 (MS-SQL), 3306 (MySQL), 514 (RSH) |
|  Medium  | 22 (SSH), 80 (HTTP), 25 (SMTP), 53 (DNS) |
|  Low     | 443 (HTTPS), 587 (SMTP TLS), 993 (IMAPS) |

---

##  Docker Services

| Container     | Image          | Port  | Role                  |
|--------------|----------------|-------|-----------------------|
| psm_mongo    | mongo:6        | 27017 | Database              |
| psm_backend  | node:18-alpine | 5000  | API + nmap + iptables |
| psm_frontend | nginx:alpine   | 3000  | React app via Nginx   |

> The backend container has `NET_ADMIN` and `NET_RAW` capabilities for iptables and nmap.

---

##  Features

- **Port Scanner** — Nmap integration with real parsing + simulated mode for demo
- **Risk Detection** — Auto-classifies ports as Low / Medium / High / Critical
- **Firewall Control** — Block/unblock ports via iptables (persisted in MongoDB)
- **Real-time Dashboard** — Radar chart + risk distribution bar chart
- **Live Alerts** — Auto-generated for high-risk open ports via Socket.io
- **Terminal Logs** — Full audit trail of every action with severity filters
- **Responsive UI** — Cyberpunk dark theme, works on desktop and tablet

---

##  Notes for Viva / Interview

1. **iptables** requires root / `NET_ADMIN` capability — handled by Docker config
2. **nmap** requires `NET_RAW` — also handled by Docker
3. In `simulate` mode, demo data is used — no nmap/iptables needed (great for demo)
4. Rules are stored in MongoDB even if iptables fails — provides audit trail regardless

---

##  Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router, Recharts, Socket.io-client |
| Backend    | Node.js, Express.js, Socket.io      |
| Database   | MongoDB + Mongoose                  |
| Scanner    | Nmap (via child_process exec)       |
| Firewall   | iptables (via child_process exec)   |
| Container  | Docker + Docker Compose             |
| Web Server | Nginx (frontend proxy)              |
