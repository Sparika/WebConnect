module.exports = function(oidc){
    var express = require('express')
    var router = express.Router()

    //authorization endpoint
    router.get('/authorize', oidc.auth());

    //token endpoint
    router.post('/token', oidc.token());

    //user consent form
    router.get('/consent', function(req, res, next) {
      var head = '<head><title>Consent</title></head>';
      var lis = [];
      for(var i in req.session.scopes) {
        lis.push('<li><b>'+i+'</b>: '+req.session.scopes[i].explain+'</li>');
      }
      var ul = '<ul>'+lis.join('')+'</ul>';
      var error = req.session.error?'<div>'+req.session.error+'</div>':'';
      var body = '<body><h1>Consent</h1><form method="POST">'+ul+'<input type="submit" name="accept" value="Accept"/><input type="submit" name="cancel" value="Cancel"/></form>'+error;
      res.send('<html>'+head+body+'</html>');
    });

    //process user consent form
    router.post('/consent', oidc.consent());

    return router
}