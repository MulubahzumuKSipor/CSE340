const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */

accController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
};

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* *****************************
 *   Register new account
 * *************************** */
accController.registerAccount = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    account_first_name,
    account_last_name,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    // Hash the password before storing it
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "message",
      "Sorry, there was an error processing the registration. Please try again."
    );
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [{ message: "Password hashing failed due to a server error." }],
      account_first_name,
      account_last_name,
      account_email,
    });
  }
  const regResult = await accountModel.registerAccount(
    account_first_name,
    account_last_name,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "message",
      `Congratulations you\'ve register ${account_first_name}. Please log in.`
    );
    res.status(201).redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  console.log("--- Login Attempt for Email:", account_email, "---");
  const accountData = await accountModel.getAccountByEmail(account_email);
  res.locals.accountData = accountData;
  // if(accountData){
  //   req.flash("message", "You are logged in.")
  //   res.status(200).render("account/account-management", {
  //     title: "Account Management",
  //     nav,
  //   })
  // }
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  console.log("LOGIN DEBUG: Account data found. Checking password...");
  console.log("  Hashed password present:", !!accountData.account_password);
  console.log("  Provided password length:", account_password.length);
  try {
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    );

    if (passwordMatch) {
      res.locals.loggedin = true;
      console.log("LOGIN SUCCESS: Passwords matched!"); // Log successful match
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "production") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: false,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/account-management");
    } else {
      req.flash("message", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.log(
      "LOGIN ERROR: Caught an exception during login process.",
      error
    );
    res.status(403).render("account/login", {
      title: "Login",
      message: "Access Forbidden",
    });
    return;
  }
};

/* ****************************************
 * Deliver account management view
 * *************************************** */
accController.buildAccountManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
  });
};

/* ****************************************
 * Deliver update account view
 * *************************************** */
accController.buildUpdateAccount = async function (req, res, next) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  try {
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account: accountData,
      errors: null,
    });
  } catch (error) {
    req.flash("notice", "Failed to load account.");
    res.redirect("/account/account-management");
  }
};

accController.accountUpdate = async function (req, res) {
  const { account_first_name, account_last_name, account_email, account_id } =
    req.body;
  const updateResult = await accountModel.updateAccount(
    account_first_name,
    account_last_name,
    account_email,
    account_id
  );
  // account_id = parseInt(req.body.account_id);
  if (isNaN(account_id)) {
    req.flash("notice", "Invalid account ID.");
    return res.redirect("/account/account-management");
  }

  if (updateResult) {
    console.log("Update Form Body:", req.body);
    req.flash("notice", "Account info updated.");
    return res.redirect("/account/account-management");
  } else {
    req.flash("notice", "Update failed.");
    return res.redirect(`/account/update-account/${account_id}`);
  }
};

accController.changePassword = async function (req, res) {
  const { account_password, account_id } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (updateResult) {
    req.flash("notice", "Password updated.");
    return res.redirect("/account/account-management");
  } else {
    req.flash("notice", "Password update failed.");
    return res.redirect(`/account/update-account/${account_id}`);
  }
};

accController.accountLogout = async function (req, res, next) {
  res.clearCookie("jwt");
  console.log("You've been logged out!");
  res.redirect("/");
};
module.exports = accController;
