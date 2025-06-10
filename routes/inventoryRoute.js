const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { get } = require("./static");
const {
  classificationRules,
  inventoryRules,
  handleValidationErrors,
  checkData,
} = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get inventory details
router.get("/detail/:invId", invController.buildInventoryDetails);

// Route to inventory management page
router.get("/", invController.buildManagement);

router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  classificationRules,
  handleValidationErrors,
  checkData,
  invController.addClassification
);

router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  inventoryRules,
  handleValidationErrors,
  checkData,
  invController.addInventory
);

module.exports = router;
