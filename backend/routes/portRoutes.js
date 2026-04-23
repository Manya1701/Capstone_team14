const express = require("express");
const router = express.Router();
const { blockPort, allowPort, getPortRules, getPortStatus } = require("../controllers/portController");

router.post("/block", blockPort);
router.post("/allow", allowPort);
router.get("/rules", getPortRules);
router.get("/status/:port", getPortStatus);

module.exports = router;
