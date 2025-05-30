const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { get } = require("./static");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get inventory details
router.get("/detail/:invId", invController.buildInventoryDetails);

module.exports = router;
