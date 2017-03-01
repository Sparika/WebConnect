// « Copyright © 2016 - 2017, Orange
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the “Software”), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial
// portions of the Software.
//
// The Software is provided “as is”, without warranty of any kind, express or implied, including but not
// limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.
// In no event shall the authors or Orange be liable for any claim, damages or other liability, whether
// in an action of contract, tort or otherwise, arising from, out of or in connection with the software
// or the use or other dealings in the Software.
// Except as contained in this notice, the name of Orange shall not be used in advertising or otherwise
// to promote the sale, use or other dealings in this Software without prior written authorization from Orange. »

"use strict";
var tryMax = 1


window.addEventListener("message", function(message){
  var request = message.data.request
  request.origin = message.origin
  switch (message.data.type) {
    case 'wid_request':
        wid_connect(message.data)
        .then(response => {
            message.source.postMessage(response, message.origin);
        })
    break;
    case 'wid_register':
        browser.runtime.sendMessage({type:"wid_register",request:request})
        // API is not waiting for a response
    break;
    default: console.log('Unknown message: '+event.data)
  }
})

/**
*   wid_connect
*   JSON request: parameters for the request in a JSON object.
*   This function request a new ID Assertion from the extension to authenticate the user.
**/
function wid_connect (request){
    return browser.runtime.sendMessage({type:"wid_request",request:request})
    .then(response => {
        if(response.error){
            return {type:"wid_error", 'response':response.error}
        } else {
            return {type:"wid_response", 'response':JSON.parse(atob(response)).assertion}
        }
        // else wid_register
        // else wid_guid
    })
    .catch(error => {
        console.log(error)
        console.error(JSON.parse(error))

    })

//    return new Promise((resolve, reject) => {
//        let tryCount = 0
//        function rcvResponse(event){
//            if(event.data.type == 'wid_response'){
//                resolve(event.data.response)
//            }
//            else if(event.data.type == 'wid_error'){
//                var error = event.data.response
//                if(error.name == 'IdpLoginError' && tryCount<tryMax){
//                    tryCount++
//                    _wid_login(error.loginUrl)
//                    //.then(event => {
//                    //    window.postMessage({type:"wid_request",request:request}, "*")
//                } else {
//                    reject(error)
//                }
//            }
//            else if(event.data.type == 'wid_tryAgain'){
//                // Use to retry rather than get directly the assertion after login
//                // i.e. not OIDC/OAuth2
//                // TODO implement retry by advertising of the already chosen IdP.
//                alert('try again')
//            }
//        }
//		    window.addEventListener("message", rcvResponse, false);
//	      window.postMessage({type:"wid_request",request:request}, "*");
//    })
}

/**
*   wid_registerGUID
*   String guid: register the given Global Unique IDentifier.
*   This function associates the current users and its identity cards to the given GUID.
*   See ReTHINK H2020 project for details on GUID.
**/
function wid_registerGUID(guid){
    window.postMessage({type:"wid_guid", request:{guid:guid}}, "*")
}

function _wid_login(loginUrl){
    var login_popup = window.open(loginUrl, "LoginWindow", 'toolbar=0,status=0,width=626,height=436')
}

function _wid_promiseToLogin(loginUrl){
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
