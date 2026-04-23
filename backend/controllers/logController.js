const Log = require("../models/Log");

async function getLogs(req, res) {
  const { limit = 50, severity, action } = req.query;
  const filter = {};
  if (severity) filter.severity = severity;
  if (action) filter.action = action;

  const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
  res.json(logs);
}

async function clearLogs(req, res) {
  await Log.deleteMany({});
  res.json({ message: "Logs cleared" });
}

module.exports = { getLogs, clearLogs };
