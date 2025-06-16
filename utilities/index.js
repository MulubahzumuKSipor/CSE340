const invModel = require("../models/inventory-model");
const Util = {};
const { validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li class='inv-item'>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildInventoryDetails = async function (vehicle) {
  let details = "";
  if (vehicle) {
    details += "<h1>" + vehicle.inv_make + " " + vehicle.inv_model + "</h1>";
    details +=
      '<div id="details"> <img src="' +
      vehicle.inv_image +
      '" alt="' +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      '">';
    details += '<ul class="details-list">';
    details +=
      "<h4>" + vehicle.inv_make + " " + vehicle.inv_model + " Details </h4>";
    details +=
      "<li><strong>Price:</strong> $" +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</li>";
    details +=
      "<li><strong>Description:</strong> " + vehicle.inv_description + "</li>";
    details += "<li><strong>Color:</strong> " + vehicle.inv_color + "</li>";
    details +=
      "<li><strong>Mileage:</strong> " +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      " mi </li>";
    details += "</ul> </div>";
  } else {
    details =
      "<p class='notice'>Sorry, no matching vehicle details could be found.</p>";
  }
  return details;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};
/* *******************************
 * Middleware for Validation
 * *******************************/

Util.classificationRules = [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .isAlpha("en-US")
    .withMessage("Only letters allowed."),
];

Util.inventoryRules = [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year")
    .trim()
    .notEmpty()
    .withMessage("Year is required.")
    .isInt({ min: 1886 })
    .withMessage("Year must be a valid number."),
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),
  body("inv_price")
    .trim()
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid amount."),
  body("inv_miles")
    .trim()
    .notEmpty()
    .withMessage("Miles is required.")
    .isInt({ min: 0 })
    .withMessage("Miles must be a non-negative number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("classification_id")
    .trim()
    .notEmpty()
    .withMessage("Classification must be selected."),
];

/* *******************************
 * Middleware for Registration Validation Rules
 * *******************************/
Util.registrationRules = [
  body("account_first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isAlpha()
    .withMessage("First name can only contain letters."),

  body("account_last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isAlpha()
    .withMessage("Last name can only contain letters."),

  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // sanitize email
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error(
          "Email already exists. Please login or use a different email."
        );
      }
    }),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    // Password must contain at least 1 capital letter, 1 number, and 1 special character
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,}$/)
    .withMessage(
      "Password must contain at least 1 capital letter, 1 number, and 1 special character."
    ),
];

Util.loginRules = [
  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // sanitize email
    .withMessage("A valid email is required."),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    // Password must contain at least 1 capital letter, 1 number, and 1 special character
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,}$/)
    .withMessage(
      "Password must contain at least 1 capital letter, 1 number, and 1 special character."
    ),
];

Util.updateAccountRules = [
  body("account_first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isAlpha()
    .withMessage("First name can only contain letters."),

  body("account_last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isAlpha()
    .withMessage("Last name can only contain letters."),

  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (account_email, { req }) => {
      const account_id = req.body.account_id;
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists && emailExists.account_id !== account_id) {
        throw new Error("Email already exists. Please use a different email.");
      }
    }),
];

Util.updatePasswordRules = [
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,}$/)
    .withMessage(
      "Password must contain at least 1 capital letter, 1 number, and 1 special character."
    ),
];

Util.handleValidationErrors = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("message", "Please fix the errors.");
    const nav = await Util.getNav();
    let viewToRender;
    let stickyData = req.body;
    if (req.originalUrl.includes("/add-classification")) {
      viewToRender = "inventory/add-classification";
    } else if (req.originalUrl.includes("/add-inventory")) {
      viewToRender = "inventory/add-inventory";
      stickyData.classificationList = await Util.buildClassificationList(
        stickyData.classification_id
      );
    } else if (req.originalUrl.includes("/register")) {
      viewToRender = "account/register";
      pageTitle = "Register New Account";
    } else if (req.originalUrl.includes("/login")) {
      viewToRender = "account/login";
      pageTitle = "Login to Your Account";
    }

    res.render(viewToRender, {
      title: pageTitle,
      nav,
      errors: errors.array(),
      ...stickyData,
    });
    return;
  }
  next();
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

Util.checkAccountType = (req, res, next) => {
  if (
    res.locals.accountData === "Employee" ||
    res.locals.accountData.account_type === "Admin"
  ) {
    next();
  } else {
    req.flash("message", "Access denied. Admins and Employess only.");
    return res.redirect("/account/login");
  }
};

Util.checkEmailExists = async function (req, res, next) {
  const { account_email } = req.body;
  const emailExists = await accountModel.checkExistingEmail(account_email);

  if (emailExists) {
    req.flash("notice", "That email is already registered.");
    res.redirect("/account/register");
  } else {
    next();
  }
};

Util.buildUserList = async function (req, res, next) {
  let data = await userModel.getAllAccounts();

  let list = "<h2> All Users registered <h2>";
  list += "<table class='full_table' >";
  list +=
    "<thead class='tabhead'><tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Type</th></tr></thead>";
  data.forEach((row) => {
    list +=
      "<tbody class='tabody'><tr><td class='elements'>" +
      row.account_first_name +
      "</td>" +
      "<td class='elements'>" +
      row.account_last_name +
      "</td>" +
      "<td class='elements'>" +
      row.account_email +
      "</td>" +
      "<td class='elements'>" +
      row.account_type +
      "</td></tr>";
  });
  list += "</table>";
  return list;
};

module.exports = Util;
