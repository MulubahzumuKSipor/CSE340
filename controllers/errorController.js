const errorController = {};
const utilities = require("../utilities/");
const errorModel = require("../models/error-model");

errorController.build500 = async (req, res, next) => {
  try {
    await errorModel.trigger500Error();
    res.status(500).render("500", {
      title: "500 - Server Error",
      nav: await utilities.getNav(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = errorController;
