const mongoose = require("mongoose");

const portDetailSchema = new mongoose.Schema({
  port: { type: Number, required: true },
  state: { type: String, enum: ["open", "closed", "filtered"], default: "closed" },
  service: { type: String, default: "unknown" },
  protocol: { type: String, default: "tcp" },
  riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
  isBlocked: { type: Boolean, default: false },
});

const scanResultSchema = new mongoose.Schema(
  {
    target: { type: String, required: true },
    scanType: { type: String, default: "standard" },
    status: { type: String, enum: ["pending", "running", "completed", "failed"], default: "pending" },
    ports: [portDetailSchema],
    openPortsCount: { type: Number, default: 0 },
    highRiskCount: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // ms
    rawOutput: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanResult", scanResultSchema);
