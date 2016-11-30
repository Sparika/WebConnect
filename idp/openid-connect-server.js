var express = require('express'),
    expressSession = require('express-session'),
    https = require('https'),
    //http = require('http'),
    fs = require('fs'),
    path = require('path'),
    rs = require('connect-redis')(expressSession),
    test = {
        status: 'new'
    },
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    jwt = require('jsonwebtoken');

var app = express();

var env = process.env.NODE_ENV || 'development'
//var config = (env == 'development' ? require('./dev_config') : require('./config'));
var config = require('./config');

var httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

var options = {
  adapters: {
    redis: {
        defaults: {
            port: config.redis.port,
            host: config.redis.host
        }
    }
  },
  login_url: '/login',
  consent_url: '/consent',
  scopes: {
    foo: 'Access to foo special resource',
    bar: 'Access to bar special resource'
  },
//when this line is enabled, user email appears in tokens sub field. By default, id is used as sub.
  models:{user:{attributes:{sub:function(){return this.email;}}}},
  app: app
};
var oidc = require('openid-connect').oidc(options);


// all environments
app.set('port', config.node.port);
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('Some Secret!!!'));
app.use(expressSession({store: new rs({host: config.redis.host, port: config.redis.port}), secret: 'Some Secret!!!'}));
// app.use(app.router);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ROUTES Definitions
app.use('/', require('./routes/index')(oidc))
app.use('/idp-admin', require('./routes/admin'))
app.use('/profile', require('./routes/profile')(oidc))
app.use('/client', require('./routes/client')(oidc))
app.use('/', require('./routes/auth')(oidc))
app.use('/proxy', require('./routes/proxy')(oidc))
app.get('/.well-known/idp-proxy/rethink-oidc', function(req, res, next){
  res.sendFile(path.join(__dirname + '/public/javascripts/rethink-oidc.js'))
});
app.get('/.well-known/idp-proxy/rethink-proxy', function(req, res, next){
  res.sendFile(path.join(__dirname + '/public/javascripts/rethink-proxy.js'))
});
app.get('/.well-known/openid-configuration', function(req, res, next){
  res.send(
        {
         "issuer": "https://192.168.99.100:8080",
         "rtcProxy": "rethink-oidc" //,
//         "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
//         "token_endpoint": "https://www.googleapis.com/oauth2/v4/token",
//         "userinfo_endpoint": "https://www.googleapis.com/oauth2/v3/userinfo",
//         "revocation_endpoint": "https://accounts.google.com/o/oauth2/revoke",
//         "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
//         "response_types_supported": [
//          "code",
//          "token",
//          "id_token",
//          "code token",
//          "code id_token",
//          "token id_token",
//          "code token id_token",
//          "none"
//         ],
//         "subject_types_supported": [
//          "public"
//         ],
//         "id_token_signing_alg_values_supported": [
//          "RS256"
//         ],
//         "scopes_supported": [
//          "openid",
//          "email",
//          "profile"
//         ],
//         "token_endpoint_auth_methods_supported": [
//          "client_secret_post",
//          "client_secret_basic"
//         ],
//         "claims_supported": [
//          "aud",
//          "email",
//          "email_verified",
//          "exp",
//          "family_name",
//          "given_name",
//          "iat",
//          "iss",
//          "locale",
//          "name",
//          "picture",
//          "sub"
//         ],
//         "code_challenge_methods_supported": [
//          "plain",
//          "S256"
//         ]
        }
  )
});
//app.use('/test', require('./routes/test')(oidc, https, app))

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

 var clearErrors = function(req, res, next) {
   delete req.session.error;
   next();
 };

var server = https.Server(httpsOptions, app)
//var server = http.createServer(app)

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
