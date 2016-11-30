module.exports = function(oidc, https, app){
    var express = require('express');
    var router = express.Router(),
        querystring = require('querystring'),
        extend = require('extend')

    router.get('/clear', function(req, res, next){
        test = {status: 'new'};
        res.redirect('/test');
    });

    router.get('/', oidc.use({policies: {loggedIn: false}, models: 'client'}), function(req, res, next) {
        var html='<h1>Test Auth Flows</h1>';
        var resOps = {
                "/test/foo": "Restricted by foo scope",
                "/test/bar": "Restricted by bar scope",
                "/test/and": "Restricted by 'bar and foo' scopes",
                "/test/or": "Restricted by 'bar or foo' scopes",
                "/test/webrtc": "WebRTC test scope",
                "/user/info": "User Info Endpoint"
        };
        var mkinputs = function(name, desc, type, value, options) {
            var inp = '';
            switch(type) {
            case 'select':
                inp = '<select id="'+name+'" name="'+name+'">';
                for(var i in options) {
                    inp += '<option value="'+i+'"'+(value&&value==i?' selected':'')+'>'+options[i]+'</option>';
                }
                inp += '</select>';
                inp = '<div><label for="'+name+'">'+(desc||name)+'</label>'+inp+'</div>';
                break;
            default:
                if(options) {
                    for(var i in options) {
                        inp +=  '<div>'+
                                    '<label for="'+name+'_'+i+'">'+options[i]+'</label>'+
                                    '<input id="'+name+'_'+i+' name="'+name+'" type="'+(type||'radio')+'" value="'+i+'"'+(value&&value==i?' checked':'')+'>'+
                                '</div>';
                    }
                } else {
                    inp = '<input type="'+(type||'text')+'" id="'+name+'"  name="'+name+'" value="'+(value||'')+'">';
                    if(type!='hidden') {
                        inp = '<div><label for="'+name+'">'+(desc||name)+'</label>'+inp+'</div>';
                    }
                }
            }
            return inp;
        };
        switch(test.status) {
        case "new":
            req.model.client.find().populate('owner').exec(function(err, clients){
                var inputs = [];
                inputs.push(mkinputs('response_type', 'Auth Flow', 'select', null, {code: 'Auth Code', "id_token token": 'Implicit'}));
                var options = {};
                clients.forEach(function(client){
                    options[client.key+':'+client.secret]=client.owner.id+' '+client.owner.email+' '+client.key+' ('+client.redirect_uris.join(', ')+')';
                });
                inputs.push(mkinputs('client_id', 'Client Key', 'select', null, options));
                //inputs.push(mkinputs('secret', 'Client Secret', 'text'));
                inputs.push(mkinputs('scope', 'Scopes', 'text'));
                inputs.push(mkinputs('nonce', 'Nonce', 'text', 'N-'+Math.random()));
                test.status='1';
                res.send(html+'<form method="GET">'+inputs.join('')+'<input type="submit"/></form>');
            });
            break;
        case '1':
            req.query.redirect_uri=req.protocol+'://'+req.headers.host+'/test'//+req.path;
            extend(test, req.query);
            console.log(req.path)
            req.query.client_id = req.query.client_id.split(':')[0];
            test.status = '2';
            res.redirect('/authorize?'+querystring.stringify(req.query));
            break;
        case '2':
            extend(test, req.query);
            if(test.response_type == 'code') {
                test.status = '3';
                var inputs = [];
                //var c = test.client_id.split(':');
                inputs.push(mkinputs('code', 'Code', 'text', req.query.code));
                /*inputs.push(mkinputs('grant_type', null, 'hidden', 'authorization_code'));
                inputs.push(mkinputs('client_id', null, 'hidden', c[0]));
                inputs.push(mkinputs('client_secret', null, 'hidden', c[1]));
                inputs.push(mkinputs('redirect_uri', null, 'hidden', test.redirect_uri));*/
                res.send(html+'<form method="GET">'+inputs.join('')+'<input type="submit" value="Get Token"/></form>');
            } else {
                test.status = '4';
                html += "Got: <div id='data'></div>";
                var inputs = [];
                //var c = test.client_id.split(':');
                inputs.push(mkinputs('access_token', 'Access Token', 'text'));
                inputs.push(mkinputs('page', 'Resource to access', 'select', null, resOps));

                var after =
                    "<script>" +
                        "document.getElementById('data').innerHTML = window.location.hash; " +
                        "var h = window.location.hash.split('&'); " +
                        "for(var i = 0; i < h.length; i++) { " +
                            "var p = h[i].split('='); " +
                            "if(p[0]=='access_token') { " +
                                "document.getElementById('access_token').value = p[1]; " +
                                "break; " +
                            "} " +
                        "}" +
                    "</script>";
                /*inputs.push(mkinputs('grant_type', null, 'hidden', 'authorization_code'));
                inputs.push(mkinputs('client_id', null, 'hidden', c[0]));
                inputs.push(mkinputs('client_secret', null, 'hidden', c[1]));
                inputs.push(mkinputs('redirect_uri', null, 'hidden', test.redirect_uri));*/
                res.send(html+'<form method="GET">'+inputs.join('')+'<input type="submit" value="Get Resource"/></form>'+after);
            }
            break;
        case '3':
            test.status = '4';
            test.code = req.query.code;
            var query = {
                    grant_type: 'authorization_code',
                    code: test.code,
                    redirect_uri: test.redirect_uri
            };
            var post_data = querystring.stringify(query);
            var post_options = {
                port: app.get('port'),
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length,
                    'Authorization': 'Basic '+Buffer(test.client_id, 'utf8').toString('base64'),
                    'Cookie': req.headers.cookie
                },
                rejectUnauthorized: false
            };

            // Set up the request
            var post_req = https.request(post_options, function(pres) {
                pres.setEncoding('utf8');
                var data = '';
                pres.on('data', function (chunk) {
                    data += chunk;
                    console.log('Response: ' + chunk);
                });
                pres.on('end', function(){
                    console.log(data);
                    try {
                        data = JSON.parse(data);
                        html += "Got: <pre>"+JSON.stringify(data)+"</pre>";
                        var inputs = [];
                        //var c = test.client_id.split(':');
                        inputs.push(mkinputs('access_token', 'Access Token', 'text', data.access_token));
                        inputs.push(mkinputs('page', 'Resource to access', 'select', null, resOps));
                        /*inputs.push(mkinputs('grant_type', null, 'hidden', 'authorization_code'));
                        inputs.push(mkinputs('client_id', null, 'hidden', c[0]));
                        inputs.push(mkinputs('client_secret', null, 'hidden', c[1]));
                        inputs.push(mkinputs('redirect_uri', null, 'hidden', test.redirect_uri));*/
                        res.send(html+'<form method="GET">'+inputs.join('')+'<input type="submit" value="Get Resource"/></form>');
                    } catch(e) {
                        res.send('<div>'+data+'</div>');
                    }
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
            break;
    //res.redirect('/user/token?'+querystring.stringify(query));
        case '4':
            test = {status: 'new'};
            res.redirect(req.query.page+'?access_token='+req.query.access_token);
        }
    });


    router.get('/webrtc', oidc.check('webrtc'), function(req, res, next){
      res.send('<h1>WebRTC scope is granted</h1>');
    });

    router.get('/foo', oidc.check('foo'), function(req, res, next){
      res.send('<h1>Page Restricted by foo scope</h1>');
    });

    router.get('/bar', oidc.check('bar'), function(req, res, next){
      res.send('<h1>Page restricted by bar scope</h1>');
    });

    router.get('/and', oidc.check('bar', 'foo'), function(req, res, next){
      res.send('<h1>Page restricted by "bar and foo" scopes</h1>');
    });

    router.get('/or', oidc.check(/bar|foo/), function(req, res, next){
      res.send('<h1>Page restricted by "bar or foo" scopes</h1>');
    });

    return router
}