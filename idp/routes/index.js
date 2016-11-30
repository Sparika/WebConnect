module.exports = function(oidc){
    var express = require('express')
    var router = express.Router()

    //redirect to login
    router.get('/', function(req, res) {
      res.redirect('/profile');
    });

    //Login form (I use email as user name)
    router.get('/login', function(req, res, next) {
    res.render('login')
    });

    var validateUser = function (req, next) {
      delete req.session.error;
      req.model.user.findOne({email: req.body.email}, function(err, user) {
          if(!err && user && user.samePassword(req.body.password)) {
            console.log(user+" "+req.body.password+"=?"+user.password)
            return next(null, user);
          } else {
            var error = new Error('Username or password incorrect.');
            return next(error);
          }
      });
    };

    var afterLogin = function (req, res, next) {
        req.model.user.findOne({id: req.session.user}, function(err, user) {
            if(err){
                res.redirect('/login')
                }
            else {
                req.session.me = {username: user.given_name, email: user.email}
                res.redirect(req.query.redirect_uri||req.query.return_url||'/profile');
            }
        })
    };

    var loginError = function (err, req, res, next) {
        req.session.error = err.message;
        console.log(err)
        res.redirect(req.path);
    };

    router.post('/login', oidc.login(validateUser), afterLogin, loginError);

    var logoutError = function (err, req, res, next){
        req.session.error = err.message
        console.log(err)
        req.session.destroy();
        res.redirect('/login')
    }

    router.get('/logout', oidc.removetokens(), function(req, res, next) {
        req.session.destroy();
        res.redirect('/login');
    }, logoutError);

    return router
}