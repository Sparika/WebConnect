module.exports = function(oidc){
    var express = require('express'),
        router = express.Router(),
        crypto = require('crypto')

    //Client list
    router.get('/', oidc.use(['client', 'consent']), function(req, res, next){
      var params = {title: 'Client', authedClients: [], ownedClients: []}
          params.me = req.session.me
      req.model.client.find({owner: req.session.user}, function(err, clients){
         console.log(clients)
         clients.forEach(function(client) {
            params.ownedClients.push({name: client.name, id: client.id})
         });

         req.model.consent.find({user: req.session.user}, function(err, consents){
            consents.forEach(function(consent){
                req.model.client.find({id: consent.client}, function(err, clients){
                   clients.forEach(function(client) {
                      params.authedClients.push({name: client.name, id: client.id})
                   })
                res.render('client/all',params)
                })
            })
         })
      })
    });

    //Client register form
    router.get('/register', oidc.use('client'), function(req, res, next) {
        res.render('client/register',{title: 'Register Client', me: req.session.me})
    });

    //process client register
    router.post('/register', oidc.use('client'), function(req, res, next) {
        delete req.session.error;
      req.body.required_sig = req.body.required_sig;
      req.body.owner = req.session.user;
      req.body.redirect_uris = req.body.redirect_uris.split(/[, ]+/);
      req.body.key = "a"
      req.body.secret = "a"
        console.log(req.body)
        console.log(req.model.client)
      req.model.client.create(req.body, function(err, client){
        if(!err && client) {
          res.redirect('/client/'+client.id);
        } else {
          next(err);
        }
      });
    });

    //Client by ID
    router.get('/:id', oidc.use('client'), function(req, res, next){
      req.model.client.findOne({id: req.params.id}, function(err, client){
          if(err) {
              next(err);
          } else if(client) {
              var html = '<h1>Client '+client.name+' Page</h1><div><a href="/client">Go back</a></div><ul><li>Requested signature: '+client.required_sig+'</li><li>Key: '+client.key+'</li><li>Secret: '+client.secret+'</li><li>Redirect Uris: <ul>';
              client.redirect_uris.forEach(function(uri){
                 html += '<li>'+uri+'</li>';
              });
              html+='</ul></li></ul>';
              res.send(html);
          } else {
              res.send('<h1>No Client Fount!</h1><div><a href="/client">Go back</a></div>');
          }
      });
    });

    return router
}