const invModel = require("../models/inventory-model");
const Util = {};
const { validationResult } = require("express-validator");
const { body } = require("express-validator");

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

Util.checkData = async function (req, res, next) {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    // If validation errors exist
    let nav = await Util.getNav(); // Always get nav for rendering

    // Set a general flash message (your existing one)
    req.flash("message", "Please fix the errors.");

    // Determine the view and title based on the route
    let viewPath;
    let pageTitle;

    if (req.originalUrl.includes("/add-classification")) {
      viewPath = "inventory/add-classification";
      pageTitle = "Add Classification";
    } else if (req.originalUrl.includes("/add-inventory")) {
      viewPath = "inventory/add-inventory";
      pageTitle = "Add Inventory";
    } else {
      // Fallback or error if an unexpected route uses this middleware
      console.error(
        "checkData middleware used on an unhandled route:",
        req.originalUrl
      );
      return next(new Error("Validation error on unhandled form."));
    }

    // Prepare locals for rendering the view
    let locals = {
      title: pageTitle,
      nav,
      errors: errors.array(), // Pass the detailed errors
      ...req.body, // Spread all form data for sticky inputs
    };

    // Special handling for add-inventory form to rebuild classification list
    if (req.originalUrl.includes("/add-inventory")) {
      locals.classificationList = await Util.buildClassificationList(
        req.body.classification_id
      );
    }

    // Render the form view immediately
    res.render(viewPath, locals);
    return; // Stop execution here, don't proceed to the controller
  }
  next(); // No errors, proceed to the next middleware/controller
};

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
    }

    res.render(viewToRender, {
      title: "Form Error",
      nav,
      errors: errors.array(),
      ...stickyData,
    });
    return;
  }
  next();
};

module.exports = Util;
