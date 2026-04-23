const mongoose = require("mongoose");

const portRuleSchema = new mongoose.Schema(
  {
    port: { type: Number, required: true, unique: true },
    protocol: { type: String, enum: ["tcp", "udp", "both"], default: "tcp" },
    action: { type: String, enum: ["allow", "block"], default: "allow" },
    service: { type: String, default: "unknown" },
    riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
    isActive: { type: Boolean, default: true },
    blockedAt: { type: Date },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortRule", portRuleSchema);
