const rateLimit = require("express-rate-limit");

// !General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// todo: search about using Redis, Memcached, etc for rate limiting

// !Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// !Order rate limiter
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const mountRateLimiters = (app) => {
  // Apply general rate limiter to all routes
  app.use("/api", generalLimiter);

  // Apply specific rate limiters to auth and order routes
  app.use("/api/v1/auth", authLimiter);
  app.use("/api/v1/orders/:cartId", orderLimiter);
  app.use("/api/v1/orders/checkout-session/:cartId", orderLimiter);
};

module.exports = mountRateLimiters;
