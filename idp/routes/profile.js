module.exports = function(oidc){
    var express = require('express')
    var router = express.Router()

    //user creation form
    router.get('/create', function(req, res, next) {
      var head = '<head><title>Sign in</title></head>';

      var inputs = '';
      //var fields = mkFields(oidc.model('user').attributes);
      var fields = {
              given_name: {
                  label: 'Given Name',
                  type: 'text'
              },
              middle_name: {
                  label: 'Middle Name',
                  type: 'text'
              },
              family_name: {
                  label: 'Family Name',
                  type: 'text'
              },
              email: {
                  label: 'Email',
                  type: 'email'
              },
              password: {
                  label: 'Password',
                  type: 'password'
              },
              passConfirm: {
                  label: 'Confirm Password',
                  type: 'password'
              }
      };
      for(var i in fields) {
        inputs += '<div><label for="'+i+'">'+fields[i].label+'</label><input type="'+fields[i].type+'" placeholder="'+fields[i].label+'" id="'+i+'"  name="'+i+'"/></div>';
      }
      var error = req.session.error?'<div>'+req.session.error+'</div>':'';
      var body = '<body><h1>Sign in</h1><form method="POST">'+inputs+'<input type="submit"/></form>'+error;
      res.send('<html>'+head+body+'</html>');
    });

    //process user creation
    router.post('/create', oidc.use({policies: {loggedIn: false}, models: 'user'}), function(req, res, next) {
      delete req.session.error;
      req.model.user.findOne({email: req.body.email}, function(err, user) {
          if(err) {
              req.session.error=err;
          } else if(user) {
              req.session.error='User already exists.';
          }
          if(req.session.error) {
              res.redirect(req.path);
          } else {
              req.body.name = req.body.given_name+' '+(req.body.middle_name?req.body.middle_name+' ':'')+req.body.family_name;
              req.model.user.create(req.body, function(err, user) {
                 if(err || !user) {

            console.log("cannot do")
            console.log(err)
            console.log(user)
                     req.session.error=err?err:'User could not be created.';
                     res.redirect(req.path);
                 } else {
                     req.session.user = user.id;
                     res.redirect('/user');
                 }
              });
          }
      });
    });

    router.get('/', oidc.check(), oidc.use({models: 'user'}), function(req, res, next){
        res.render('profile', {me:req.session.me, params:{iss:req.headers.host, sub:req.session.me.email, type:'rethink-oidc', name:req.session.me.email}})
    });

    //User Info Endpoint
    router.get('/info', oidc.userInfo());

    function mkFields(params) {
      var fields={};
      for(var i in params) {
        if(params[i].html) {
          fields[i] = {};
          fields[i].label = params[i].label||(i.charAt(0).toUpperCase()+i.slice(1)).replace(/_/g, ' ');
          switch(params[i].html) {
        case 'password':
          fields[i].html = '<input class="form-control" type="password" id="'+i+'" name="'+i+'" placeholder="'+fields[i].label+'"'+(params[i].mandatory?' required':'')+'/>';
          break;
        case 'date':
          fields[i].html = '<input class="form-control" type="date" id="'+i+'" name="'+i+'"'+(params[i].mandatory?' required':'')+'/>';
          break;
        case 'hidden':
          fields[i].html = '<input class="form-control" type="hidden" id="'+i+'" name="'+i+'"/>';
          fields[i].label = false;
          break;
        case 'fixed':
          fields[i].html = '<span class="form-control">'+params[i].value+'</span>';
          break;
        case 'radio':
          fields[i].html = '';
          for(var j=0; j<params[i].ops; j++) {
            fields[i].html += '<input class="form-control" type="radio" id="'+i+'_'+j+'" name="'+i+'" '+(params[i].mandatory?' required':'')+'/> '+params[i].ops[j];
          }
        break;
        default:
          fields[i].html = '<input class="form-control" type="text" id="'+i+'" name="'+i+'" placeholder="'+fields[i].label+'"'+(params[i].mandatory?' required':'')+'/>';
          break;
          }
        }
      }
      return fields;
    }

    return router
}