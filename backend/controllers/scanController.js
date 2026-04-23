const { exec } = require("child_process");
const ScanResult = require("../models/ScanResult");
const Log = require("../models/Log");
const Alert = require("../models/Alert");
const { getPortRiskInfo, isHighRisk } = require("../middleware/portRiskDb");

/**
 * Parse nmap XML-style text output into port objects
 */
function parseNmapOutput(output, target) {
  const ports = [];
  const lines = output.split("\n");

  for (const line of lines) {
    // Match lines like: 22/tcp   open  ssh
    const match = line.match(/^(\d+)\/(tcp|udp)\s+(open|closed|filtered)\s*(.*)$/);
    if (match) {
      const port = parseInt(match[1]);
      const protocol = match[2];
      const state = match[3];
      const detectedService = match[4].trim().split(" ")[0] || "unknown";

      const riskInfo = getPortRiskInfo(port);

      ports.push({
        port,
        protocol,
        state,
        service: riskInfo.service !== "unknown" ? riskInfo.service : detectedService,
        riskLevel: riskInfo.risk,
        isBlocked: false,
      });
    }
  }

  return ports;
}

/**
 * Run nmap scan
 */
function runNmap(target, portRange = "1-1000") {
  return new Promise((resolve, reject) => {
    // -sV: version detection, -T4: aggressive timing, --open: show open ports only
    const cmd = `nmap -p ${portRange} -T4 --open ${target} 2>&1`;
    console.log(`[NMAP] Running: ${cmd}`);

    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return reject(new Error(`nmap failed: ${error.message}`));
      }
      resolve(stdout || stderr);
    });
  });
}

/**
 * Simulate a scan (used when nmap is not available / for demo/dev)
 */
function simulateScan(target) {
  const demoOpenPorts = [22, 80, 443, 3306, 23, 3389, 8080];
  const ports = demoOpenPorts.map((port) => {
    const riskInfo = getPortRiskInfo(port);
    return {
      port,
      protocol: "tcp",
      state: "open",
      service: riskInfo.service,
      riskLevel: riskInfo.risk,
      isBlocked: false,
    };
  });
  return ports;
}

/**
 * POST /api/scan
 * Start a new port scan
 */
async function startScan(req, res) {
  const { target = "127.0.0.1", portRange = "1-1000", simulate = false } = req.body;
  const io = req.app.get("io");

  // Create scan record
  const scan = await ScanResult.create({
    target,
    scanType: simulate ? "simulated" : "nmap",
    status: "running",
  });

  // Log scan start
  await Log.create({
    action: "scan_started",
    target,
    message: `Port scan started on ${target} (range: ${portRange})`,
    severity: "info",
  });

  // Emit scan started event
  io.emit("scan:started", { scanId: scan._id, target });

  res.json({ message: "Scan started", scanId: scan._id });

  // Run scan asynchronously
  const startTime = Date.now();

  try {
    let ports;

    if (simulate) {
      await new Promise((r) => setTimeout(r, 2000)); // fake delay
      ports = simulateScan(target);
    } else {
      const output = await runNmap(target, portRange);
      ports = parseNmapOutput(output, target);
      scan.rawOutput = output;
    }

    const duration = Date.now() - startTime;
    const openPorts = ports.filter((p) => p.state === "open");
    const highRiskPorts = openPorts.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical");

    // Update scan record
    scan.ports = ports;
    scan.openPortsCount = openPorts.length;
    scan.highRiskCount = highRiskPorts.length;
    scan.duration = duration;
    scan.status = "completed";
    await scan.save();

    // Create alerts for high-risk ports
    for (const p of highRiskPorts) {
      const riskInfo = getPortRiskInfo(p.port);
      const alert = await Alert.create({
        title: `${p.riskLevel.toUpperCase()} Risk: Port ${p.port} Open`,
        message: `Port ${p.port} (${p.service}) is open on ${target}. ${riskInfo.reason}`,
        severity: p.riskLevel,
        port: p.port,
        target,
      });
      io.emit("alert:new", alert);
    }

    // Log completion
    await Log.create({
      action: "scan_completed",
      target,
      message: `Scan completed. Found ${openPorts.length} open ports, ${highRiskPorts.length} high risk.`,
      severity: highRiskPorts.length > 0 ? "warning" : "info",
      metadata: { openPorts: openPorts.length, highRisk: highRiskPorts.length },
    });

    io.emit("scan:completed", {
      scanId: scan._id,
      target,
      openPorts: openPorts.length,
      highRisk: highRiskPorts.length,
      ports,
    });
  } catch (err) {
    scan.status = "failed";
    await scan.save();

    await Log.create({
      action: "scan_started",
      target,
      message: `Scan failed: ${err.message}`,
      severity: "error",
    });

    io.emit("scan:failed", { scanId: scan._id, error: err.message });
  }
}

/**
 * GET /api/scan
 * Get all past scans
 */
async function getScans(req, res) {
  const scans = await ScanResult.find().sort({ createdAt: -1 }).limit(20);
  res.json(scans);
}

/**
 * GET /api/scan/:id
 * Get a specific scan result
 */
async function getScanById(req, res) {
  const scan = await ScanResult.findById(req.params.id);
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json(scan);
}

module.exports = { startScan, getScans, getScanById };
