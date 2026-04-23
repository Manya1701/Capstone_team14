const express = require("express");
const router = express.Router();
const { startScan, getScans, getScanById } = require("../controllers/scanController");

router.post("/", startScan);
router.get("/", getScans);
router.get("/:id", getScanById);

module.exports = router;
