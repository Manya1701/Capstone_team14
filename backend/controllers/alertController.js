const Alert = require("../models/Alert");

async function getAlerts(req, res) {
  const { acknowledged } = req.query;
  const filter = {};
  if (acknowledged !== undefined) filter.acknowledged = acknowledged === "true";

  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(alerts);
}

async function acknowledgeAlert(req, res) {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { acknowledged: true, acknowledgedAt: new Date() },
    { new: true }
  );
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.json(alert);
}

async function acknowledgeAll(req, res) {
  await Alert.updateMany({ acknowledged: false }, { acknowledged: true, acknowledgedAt: new Date() });
  res.json({ message: "All alerts acknowledged" });
}

async function deleteAlert(req, res) {
  await Alert.findByIdAndDelete(req.params.id);
  res.json({ message: "Alert deleted" });
}

module.exports = { getAlerts, acknowledgeAlert, acknowledgeAll, deleteAlert };
