const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["scan_started", "scan_completed", "port_blocked", "port_allowed", "alert_triggered", "system"],
      required: true,
    },
    target: { type: String },
    port: { type: Number },
    message: { type: String, required: true },
    severity: { type: String, enum: ["info", "warning", "error", "critical"], default: "info" },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
