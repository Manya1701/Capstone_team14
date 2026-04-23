const { exec } = require("child_process");
const PortRule = require("../models/PortRule");
const Log = require("../models/Log");
const Alert = require("../models/Alert");
const { getPortRiskInfo } = require("../middleware/portRiskDb");

/**
 * Run an iptables command
 * Falls back gracefully if not root / not available
 */
function runIptables(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[iptables] Warning: ${error.message}`);
        resolve({ success: false, message: error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
}

/**
 * POST /api/ports/block
 */
async function blockPort(req, res) {
  const { port, protocol = "tcp", reason = "Manually blocked by admin" } = req.body;
  if (!port) return res.status(400).json({ error: "Port number required" });

  const io = req.app.get("io");
  const riskInfo = getPortRiskInfo(port);

  // Run iptables block rule
  const result = await runIptables(
    `iptables -A INPUT -p ${protocol} --dport ${port} -j DROP`
  );

  // Save/update port rule in DB
  const rule = await PortRule.findOneAndUpdate(
    { port },
    {
      port,
      protocol,
      action: "block",
      service: riskInfo.service,
      riskLevel: riskInfo.risk,
      isActive: true,
      blockedAt: new Date(),
      reason,
    },
    { upsert: true, new: true }
  );

  await Log.create({
    action: "port_blocked",
    port,
    message: `Port ${port}/${protocol} (${riskInfo.service}) blocked. Reason: ${reason}`,
    severity: "warning",
    metadata: { iptablesSuccess: result.success },
  });

  io.emit("port:blocked", { port, protocol, service: riskInfo.service });

  res.json({
    message: `Port ${port} blocked`,
    rule,
    iptables: result,
  });
}

/**
 * POST /api/ports/allow
 */
async function allowPort(req, res) {
  const { port, protocol = "tcp" } = req.body;
  if (!port) return res.status(400).json({ error: "Port number required" });

  const io = req.app.get("io");
  const riskInfo = getPortRiskInfo(port);

  // Remove iptables block rule
  const result = await runIptables(
    `iptables -D INPUT -p ${protocol} --dport ${port} -j DROP`
  );

  // Update DB rule
  const rule = await PortRule.findOneAndUpdate(
    { port },
    { action: "allow", isActive: true },
    { upsert: true, new: true }
  );

  await Log.create({
    action: "port_allowed",
    port,
    message: `Port ${port}/${protocol} (${riskInfo.service}) allowed/unblocked`,
    severity: "info",
    metadata: { iptablesSuccess: result.success },
  });

  io.emit("port:allowed", { port, protocol, service: riskInfo.service });

  res.json({
    message: `Port ${port} allowed`,
    rule,
    iptables: result,
  });
}

/**
 * GET /api/ports/rules
 * Get all port rules
 */
async function getPortRules(req, res) {
  const rules = await PortRule.find().sort({ updatedAt: -1 });
  res.json(rules);
}

/**
 * GET /api/ports/status/:port
 */
async function getPortStatus(req, res) {
  const port = parseInt(req.params.port);
  const rule = await PortRule.findOne({ port });
  const riskInfo = getPortRiskInfo(port);

  res.json({
    port,
    riskInfo,
    rule: rule || { action: "allow", port },
  });
}

module.exports = { blockPort, allowPort, getPortRules, getPortStatus };
