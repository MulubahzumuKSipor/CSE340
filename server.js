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
const pool = require("./database/");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const errorRoute = require("./routes/errorRoute");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware
 * This is used to parse the body of the request
 * so that we can access the data in the request body
 *************************/
// Session setup
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.Session_Secret, // use a strong secret in production
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Flash message middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.message = req.flash("message");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.use(utilities.checkJWTToken);
/* ***********************
 * Routes
 *************************/

app.use(static);
// Index Route
app.get("/", baseController.buildHome);
// Account ROute
app.use("/account", accountRoute);
// Inventory Route
app.use("/inv", inventoryRoute);
// Users Route
app.use("/user", userRoute);
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
  // console.error(`Error at: "${req.originalUrl}": ${err.message}`);
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
