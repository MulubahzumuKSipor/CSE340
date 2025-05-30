/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const errorRoute = require("./routes/errorRoute");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index Route
app.get("/", baseController.buildHome);
// Inventory Route
app.use("/inv", inventoryRoute);
// 500 Error Route
app.use("/", errorRoute);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

/* ***********************
 * Middleware
 * This is used to parse the body of the request
 * so that we can access the data in the request body
 *************************/
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  const nav = await require("./utilities/").getNav();
  res.status(500).render("error/error", {
    title: "Server Error",
    message: "Something went wrong on the server.",
    nav,
  });
});

app.use(async (req, res) => {
  const nav = await require("./utilities/").getNav();
  res.status(404).render("error/error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
    nav,
  });
});
