const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
// invCont.buildByClassificationId = async function (req, res, next) {
//   const classification_id = req.params.classificationId;
//   const data = await invModel.getInventoryByClassificationId(classification_id);
//   const grid = await utilities.buildClassificationGrid(data);
//   let nav = await utilities.getNav();
//   const className = data[0].classification_name;
//   res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//   });
// };

/* ********************************
 * Build Inventory details view
 * ******************************** */
invCont.buildInventoryDetails = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryDetails(inv_id);
  console.log("data", data);
  const item = data;
  const details = await utilities.buildInventoryDetails(data);
  const nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: item.inv_make + " " + item.inv_model + " Details",
    nav,
    details,
  });
};

/* ********************************
 * Build inventory management view
 * ******************************** */

invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
    const message = req.flash("message");
    console.log("Flash message:", message);
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      message,
    });
  } catch (error) {
    console.error("Error in buildManagement:", error);
    next(error);
  }
};

/* ********************************
 * Build add classification and inventory view
 * ******************************** */

invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: req.flash("errors"),
    classification_name: req.body.classification_name || "",
  });
};

invCont.buildAddInventory = async function (req, res, next) {
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  const nav = await utilities.getNav();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: req.flash("errors"),
    ...req.body,
  });
};
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("Warning", "Please fix the errors.");
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
    });
    return;
  }

  const { classification_name } = req.body;
  const result = await invModel.addClassification({ classification_name });

  if (result) {
    req.flash(
      "message",
      `The ${classification_name} classification was successfully added.`
    );
    nav = await utilities.getNav();
    res.redirect("/inv/");
  } else {
    req.flash("message", "Error adding classification. Please try again.");
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: classification_name,
    });
  }
};

invCont.addInventory = async function (req, res, next) {
  const invData = req.body;
  const result = await invModel.addInventory(invData);

  if (result) {
    req.flash("message", "Inventory item added.");
    res.redirect("/inv/");
  } else {
    const classificationList = await utilities.buildClassificationList(
      invData.classification_id
    );
    req.flash("message", "Error adding inventory item.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      ...invData,
    });
  }
};

/* ********************************
 * Display vehicle grid even if no inventory items are found
 * ******************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;

  const classificationInfo = await invModel.getClassificationNameById(
    classification_id
  );

  if (!classificationInfo) {
    req.flash("notice", "Sorry, that classification does not exist.");
    let nav = await utilities.getNav();
    return res.status(404).render("errors/error", {
      title: "404 Not Found",
      message: "The requested classification could not be found.",
      nav,
      errors: null,
    });
  }

  const className = classificationInfo.classification_name;

  const data = await invModel.getInventoryByClassificationId(classification_id);

  const grid = await utilities.buildClassificationGrid(data);

  let nav = await utilities.getNav();

  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont;
