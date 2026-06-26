// myApp.js - Complete working code
const express = require("express");
const app = express();
const helmet = require("helmet");

// Serve static files
app.use(express.static("public"));

// 1. Mount Helmet middleware (must be first)
app.use(helmet());

// 3. Set Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
    },
  }),
);

// 4. Set X-DNS-Prefetch-Control
app.use(helmet.dnsPrefetchControl());

// 5. Set X-Frame-Options
app.use(helmet.frameguard({ action: "deny" }));

// 6. Set X-XSS-Protection
app.use(helmet.xssFilter());

// 7. Set X-Content-Type-Options
app.use(helmet.noSniff());

// 8. Set Strict-Transport-Security
const ninetyDaysInSeconds = 90 * 24 * 60 * 60;
app.use(
  helmet.hsts({
    maxAge: ninetyDaysInSeconds,
    force: true,
  }),
);

// Body parsers — must be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API routes
require('./routes/api.js')(app);

// Export app for testing
module.exports = app;

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Your app is listening on port ${port}`);
});
