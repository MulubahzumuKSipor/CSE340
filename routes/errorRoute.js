const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

router.get("/build500", errorController.build500);

module.exports = router;
