"use strict";
var tryMax = 1
/**
*   wid_connect
*   JSON request: parameters for the request in a JSON object.
*   This function request a new ID Assertion from the extension to authenticate the user.
**/
function wid_connect (request){
    return new Promise((resolve, reject) => {
        let tryCount = 0
        function rcvResponse(event){
            console.error(event)
            if(event.data.type == 'wid_response'){
                console.error(event.data)
                resolve(event.data.response)
            }
            else if(event.data.type == 'wid_error'){
                var error = event.data.response
                if(error.name == 'IdpLoginError' && tryCount<tryMax){
                    tryCount++
                    login(error.loginUrl)
                    //.then(event => {
                    //    window.postMessage({type:"wid_request",request:request}, "*")
                } else {
                    reject(error)
                }
            }
            else if(event.data.type == 'wid_tryAgain'){
                // Use to retry rather than get directly the assertion after login
                // i.e. not OIDC/OAuth2
                // TODO implement retry by advertising of the already chosen IdP.
                alert('try again')
            }
        }
		window.addEventListener("message", rcvResponse, false);
	    window.postMessage({type:"wid_request",request:request}, "*");
    })
}

/**
*   wid_register
*   String domain: the IdP domain name.
*   String type: the IdP proxy type.
*   This function register an IdP Proxy in the WID Connect extension.
*   Following standard WebRTC, the proxy is available at https://domain/.well-known/idp-proxy/type
**/
function wid_register (iss, sub, type, name){
    window.postMessage({type:"widp_register",request:{iss:iss, sub:sub, proxy:{type:type}, name:name}}, "*");
}


function login(loginUrl){
    var login_popup = window.open(loginUrl, "LoginWindow", 'toolbar=0,status=0,width=626,height=436')
}

function promiseLogin(loginUrl){
    var login_popup = window.open(loginUrl, "LoginWindow", 'toolbar=0,status=0,width=626,height=436')
    return new Promise(function(resolve, reject){
        login_popup.onunload = function(){
            if(login_popup.closed){
                alert('closed')
                resolve('close')
            }
        }
    })
}