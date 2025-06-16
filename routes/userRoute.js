const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const utilities = require("../utilities/index");
// const { checkExistingEmail } = require("../models/account-model");

router.get("/users", utilities.checkAccountType, userController.displayUser);

module.exports = router;
