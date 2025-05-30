const invModel = require("../models/inventory-model");
const Util = {};

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

module.exports = Util;
