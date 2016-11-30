module.exports = function(oidc){
    var express = require('express')
    var router = express.Router(),
        path = require('path'),
        pem2jwk = require('pem-jwk').pem2jwk,
        jwk2pem = require('pem-jwk').jwk2pem

    //authorization endpoint
    router.get('/authorize', oidc.auth());

    router.get('/done', oidc.check(), function(req, res, next){
    //       res.send("{}")
        res.send("<script>"+
            "var jsonString = {};"+
            "var data = window.location.hash.substring(1).split('&').toString().split(/[=,]+/);"+
            "for(var i=0; i<data.length; i+=2){jsonString[data[i]]=data[i+1];}"+
            //"var msg = JSON.stringify(jsonString);"+

            "window.opener.postMessage({type:'wid_response', response:jsonString.id_token}, '*');"+
            //Unsecure send to all
            //"window.opener.postMessage('close_me',\"*\");"+
            "window.close();"+
            "</script>");
    });



    router.get('/key', oidc.use({policies: {loggedIn: false}, models: 'client'}), function(req, res, next) {
      req.model.client.find({name: "rethink-oidc"}, function(err, client){
        if (!err && client) {
            var jwk = pem2jwk(new Buffer(client[0].key, 'base64'))
            res.send(JSON.stringify(jwk))
        } else {
            next(err)
        }
      });
    });
    router.get('/keyset', oidc.use({policies: {loggedIn: false}, models: 'client'}), function(req, res, next) {
        req.model.client.find({name: "rethink-oidc"}, function(err, client){
        if (!err && client) {
            var jwk = pem2jwk(new Buffer(client[0].key, 'base64'))
            var jku = {keys: [jwk]}
            res.send(JSON.stringify(jku))
        } else {
            next(err)
        }
      });
    });
    router.get('/id', oidc.use({policies: {loggedIn: false}, models: 'client'}), function(req, res, next) {
      req.model.client.find({name: "rethink-oidc"}, function(err, client){
        if (!err && client) {
            var json = {}
            json.key = client[0].key
            res.send(json)
        } else {
            next(err)
        }
      });
    });

    router.get('/verify', function(req, res, next){
        // sign with default (HMAC SHA256)
        var jwt = require('jsonwebtoken');
        var token = req.query.id_token;
        var cert = new Buffer(req.query.key, 'base64').toString('binary')

        jwt.verify(token, cert, { algorithms: ['RS256'] }, function(err, decoded) {
          res.json({
            error: err,
            id_token: decoded
          });
        });
    });

    router.get('/test', function(req, res, next){
        res.sendFile(path.join(__dirname + '/../IdPProxy_test.html'));
    });

    return router
}