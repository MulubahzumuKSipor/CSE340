const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

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

module.exports = invCont;
