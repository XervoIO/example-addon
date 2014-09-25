var crypto    = require('crypto');
var express   = require('express');
var basicAuth = require('basic-auth-connect');
var config    = require('./addon-manifest.json');

var app = express();

// Authentication parameters are defined in addon-manifest.json
var auth = basicAuth(config.id, config.api.password);

app.use(require('body-parser').json());
app.use(require('cookie-parser')());
app.use(require('cookie-session')({ secret: 'addons' }));

//
// Provision
// =========
//
// Provision a new add-on for use.
// Requires basic authentication.
//
app.post('/modulus/resources', auth, function(req, res) {
  res.send({
    id: 666
  , config: { 'MYADDON_API_KEY': 'some-key', 'MYADDON_URL': 'http://example.com' }
  , message: null
  });
});

//
// Deprovision
// ===========
//
// Deprovision an existing add-on.
// Requires basic authentication.
//
app.delete('/modulus/resources/:id', auth, function(req, res) {
  res.status(200).send();
});

//
// Plan change
// ===========
//
// Change the plan for an existing add-on.
// Requires basic authentication.
//
app.put('/modulus/resources/:id', auth, function(req, res) {
  res.send({ message: null });
});

//
// Single sign on
// ==============
//
// Log a user in using their email address. Uses SHA1 hashed token.
//
app.post('/sso/login', function(req, res) {
  var preToken = req.body.id + ':' + config.api.sso_salt + ':' + req.body.timestamp;
  var token = crypto.createHash('sha1').update(preToken).digest('hex');

  // Validate token.
  if (token !== req.body.token) {
    return res.status(403).send();
  }

  // Attach the user information to the session.
  req.session.id = req.body.id;
  req.session.email = req.body.id;
  req.session.navData = req.body['nav-data'];

  res.cookie('nav-data', req.body['nav-data']);

  res.redirect('/modulus/ssolanding');
});

//
// SSO Landing page
// ================
//
// Landing page for successful single sign on attempt.
//
app.get('/modulus/ssolanding', function(req, res) {
  res.setHeader('ContentType', 'text/html');
  res.send([
    '<!DOCTYPE html>'
  , '<head>'
  , '<meta charset="utf-8">'
  , '<title>Test</title>'
  , '</head>'
  , '<body></body>'
  , '</html>'
  ].join('\n'));
});

// Use the port supplied by the environment for production.
app.listen(3000 || process.env.PORT);
