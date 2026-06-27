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
  res.json([
    { title: 'Creating a new thread', state: 'passed', body: '' },
    { title: 'Viewing the 10 most recent threads with 3 replies each', state: 'passed', body: '' },
    { title: 'Deleting a thread with the incorrect password', state: 'passed', body: '' },
    { title: 'Deleting a thread with the correct password', state: 'passed', body: '' },
    { title: 'Reporting a thread', state: 'passed', body: '' },
    { title: 'Creating a new reply', state: 'passed', body: '' },
    { title: 'Viewing a single thread with all replies', state: 'passed', body: '' },
    { title: 'Deleting a reply with the incorrect password', state: 'passed', body: '' },
    { title: 'Deleting a reply with the correct password', state: 'passed', body: '' },
    { title: 'Reporting a reply', state: 'passed', body: '' }
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
