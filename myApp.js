'use strict';
const express = require("express");
const app = express();
const helmet = require("helmet");

// CORS - must be absolute first middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve static files
app.use(express.static("public"));

// Helmet middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
  },
}));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());

const ninetyDaysInSeconds = 90 * 24 * 60 * 60;
app.use(helmet.hsts({ maxAge: ninetyDaysInSeconds, force: true }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API routes
require('./routes/api.js')(app);

// app-info route for freeCodeCamp verification
app.get('/_api/app-info', (req, res) => {
  var appStack = app._router.stack
    .filter(s => s.name && s.name !== 'query' && s.name !== 'expressInit' && s.name !== 'serveStatic')
    .map(s => s.name);
  res.json({ headers: res.getHeaders(), appStack });
});

module.exports = app;

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Your app is listening on port ${port}`);
});
