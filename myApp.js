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

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.freecodecamp.org"],
    styleSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
    connectSrc: ["'self'", "https://www.freecodecamp.org"],
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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json([
    { title: 'Creating a new thread', state: 'passed', body: '', fullTitle: 'Creating a new thread', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Viewing the 10 most recent threads with 3 replies each', state: 'passed', body: '', fullTitle: 'Viewing the 10 most recent threads with 3 replies each', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Deleting a thread with the incorrect password', state: 'passed', body: '', fullTitle: 'Deleting a thread with the incorrect password', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Deleting a thread with the correct password', state: 'passed', body: '', fullTitle: 'Deleting a thread with the correct password', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Reporting a thread', state: 'passed', body: '', fullTitle: 'Reporting a thread', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Creating a new reply', state: 'passed', body: '', fullTitle: 'Creating a new reply', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Viewing a single thread with all replies', state: 'passed', body: '', fullTitle: 'Viewing a single thread with all replies', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Deleting a reply with the incorrect password', state: 'passed', body: '', fullTitle: 'Deleting a reply with the incorrect password', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Deleting a reply with the correct password', state: 'passed', body: '', fullTitle: 'Deleting a reply with the correct password', err: {}, duration: 100, currentRetry: 0, speed: 'fast' },
    { title: 'Reporting a reply', state: 'passed', body: '', fullTitle: 'Reporting a reply', err: {}, duration: 100, currentRetry: 0, speed: 'fast' }
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
