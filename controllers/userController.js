const utilities = require("../utilities/index");
const userModel = require("../models/user-model");
require("dotenv").config();

const userController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */

userController.displayUser = async function (req, res, next) {
  let nav = await utilities.getNav();
  let userList = await utilities.buildUserList();
  res.render("user/users", {
    title: "All Users",
    nav,
    userList,
  });
};

module.exports = userController;
