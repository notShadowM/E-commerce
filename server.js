// todo: when you work on any feature it is good to analyze the logic step by step and then apply it, like right some comments to demonstrate your plan, and then start coding, it will help you to understand the feature and also it will help you to write clean code
const path = require("path");
require("dotenv").config({ path: "config.env" });
const express = require("express");
const cors = require("cors");
const compression = require("compression");

const dbConnection = require("./config/database");
const globalError = require("./middlewares/errorMiddleware");
const ApiError = require("./utils/apiError");
// Routes
const mountRoutes = require("./routes");
const { webhookCheckout } = require("./services/orederService");

// !Connect to database
dbConnection();

// !express app
const app = express();

// !Middlewares
app.use(cors()); // !Enable cors for all routes
app.options("*", cors()); // todo: search about cors and preflight request
app.use(compression()); // !Compress all responses

// todo: shouldn't express.json() would be enough instead of express.raw
// todo: shouldn't we move the webhookCheckout inside of the orderService? or does it slow the process?
// todo: shouldn't we use cors for stripe webhook to accept only from stripe?
// !checkout webhook
app.post(
  "webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  // todo: eslint giving me error about using morgan as a dependency, but ig it is fine to use it as a dev dependency "change the rule later :)"
  const morgan = require("morgan");
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// !Mount routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// !Global error handler middleware
app.use(globalError);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// !Handle unhandled promise rejections outside of express
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.name} - ${err.message}`);
  server.close(() => {
    console.log("Shutting down the server due to unhandled rejection");
    process.exit(1);
  });
});
