const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { get } = require("./static");
const {
  classificationRules,
  inventoryRules,
  handleValidationErrors,
  checkAccountType,
} = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get inventory details
router.get("/detail/:invId", invController.buildInventoryDetails);

// Route to inventory management page
router.get("/", checkAccountType, invController.buildManagement);

router.get(
  "/add-classification",
  checkAccountType,
  invController.buildAddClassification
);
router.post(
  "/add-classification",
  checkAccountType,
  classificationRules,
  handleValidationErrors,
  invController.addClassification
);

router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  checkAccountType,
  inventoryRules,
  handleValidationErrors,
  invController.addInventory
);

router.get("/getInventory/:classification_id", invController.getInventoryJSON);

module.exports = router;
