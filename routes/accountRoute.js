const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/index");
// const { checkExistingEmail } = require("../models/account-model");

router.get("/login", accountController.buildLogin);

router.post(
  "/login",
  utilities.loginRules,
  utilities.handleValidationErrors,
  accountController.accountLogin
);

router.get("/register", accountController.buildRegister);
router.post(
  "/register",
  utilities.registrationRules,
  utilities.checkEmailExists,
  utilities.handleValidationErrors,
  accountController.registerAccount
);

router.get("/account-management", accountController.buildAccountManagement);

// router.get("/update-account", accountController.buildUpdateAccount);

router.get("/update-account/:account_id", accountController.buildUpdateAccount);
router.post(
  "/update-account",
  utilities.updateAccountRules,
  accountController.accountUpdate
);
router.post(
  "/update-password",
  utilities.updatePasswordRules,
  accountController.changePassword
);

router.get("/logout", accountController.accountLogout);

module.exports = router;
