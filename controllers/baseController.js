const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  // const account = await utilities.loginStatus();
  req.flash("notice", "This is a flash message.");
  res.render("index", { title: "Home", nav });
};

module.exports = baseController;
