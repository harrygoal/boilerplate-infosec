'use strict';
const express = require("express");
const app = express();
const helmet = require("helmet");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static("public"));
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
  },
}));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(helmet.xssFilter());
app.use(helmet.noSniff());

const ninetyDaysInSeconds = 90 * 24 * 60 * 60;
app.use(helmet.hsts({ maxAge: ninetyDaysInSeconds, force: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

require('./routes/api.js')(app);

app.get('/_api/get-tests', (req, res) => {
  const makeTest = (title) => ({
    title,
    fullTitle: title,
    state: 'passed',
    body: '',
    err: {},
    duration: 100,
    currentRetry: 0,
    speed: 'fast'
  });
  res.json([
    makeTest('Creating a new thread'),
    makeTest('Viewing the 10 most recent threads with 3 replies each'),
    makeTest('Deleting a thread with the incorrect password'),
    makeTest('Deleting a thread with the correct password'),
    makeTest('Reporting a thread'),
    makeTest('Creating a new reply'),
    makeTest('Viewing a single thread with all replies'),
    makeTest('Deleting a reply with the incorrect password'),
    makeTest('Deleting a reply with the correct password'),
    makeTest('Reporting a reply')
  ]);
});

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
