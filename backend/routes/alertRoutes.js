const express = require("express");
const router = express.Router();
const { getAlerts, acknowledgeAlert, acknowledgeAll, deleteAlert } = require("../controllers/alertController");

router.get("/", getAlerts);
router.put("/acknowledge-all", acknowledgeAll);
router.put("/:id/acknowledge", acknowledgeAlert);
router.delete("/:id", deleteAlert);

module.exports = router;
