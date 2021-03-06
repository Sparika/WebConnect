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
  if(request){
      request.origin = message.origin
      switch (message.data.type) {
        case 'wid_request':
            browser.runtime.sendMessage({type:"wid_request",request:message.data})
            .then(_getIdentityAssertion)
            .then(assertion => {
                var response = {type:"wid_response", 'response':JSON.parse(atob(assertion)).assertion}
                message.source.postMessage(response, message.origin);
            })
            .catch(error => {
                console.error(error)
            })
        break;
        case 'wid_register':
            console.log('REGISTER')
            console.log(request)
            browser.runtime.sendMessage({type:"wid_register",request:request})
            // API is not waiting for a response
        break;
        default: console.log('Unknown message: '+event.data)
      }
  }
})

/**
*   wid_registerGUID
*   String guid: register the given Global Unique IDentifier.
*   This function associates the current users and its identity cards to the given GUID.
*   See ReTHINK H2020 project for details on GUID.
**/
function wid_registerGUID(guid){
    window.postMessage({type:"wid_guid", request:{guid:guid}}, "*")
}

function _getIdentityAssertion(response){
    console.log("GET ID ASSERTION")
    var identity = JSON.parse(response)
    var pc = new RTCPeerConnection()
    // TODO use hint
    pc.setIdentityProvider(identity.iss, identity.proxy)
    return pc.getIdentityAssertion()
    .catch(error => {
        error = JSON.parse(error.message)
        if(error.name == 'IdpLoginError' && error.loginUrl){
            return _login(error.loginUrl)
            // Single retry
            .then(res => {
                return pc.getIdentityAssertion()
            })
        } else {
            throw error
        }
    })
}

var deffered = {resolve:null,
                reject:null,
                resolved:true},
    loginPage;
function _login(loginUrl){
    if(!deffered.resolved){
        deffered.resolved = true
        deffered.reject('NEWLOGINREQUESTED')
    }
    return new Promise(function(resolve, reject){
        loginPage = window.open(loginUrl, 'loginPage')
        deffered.resolve = resolve
        deffered.reject = reject
        deffered.resolved = false
        var timer = setInterval(function() {
            try{
                if(loginPage.closed) {
                    clearInterval(timer);
                    deffered.resolved = true
                    reject('LOGINABORTED')
                }
            } catch(error){
                // Resolved by page closed and LOGINDONE
                clearInterval(timer);
                console.log(error)
            }
        }, 1000);
    })
    //loginPage.close()
}
                /************************************************************
                /       TODO DETECT DOMString "LOGINDONE" MESSAGE
                /***********************************************************/
function loginDoneListener(message){
    if(message.data == "LOGINDONE" && deffered.resolved == false){
        console.log('LOGINDONE Resolve')
        deffered.resolved = true
        deffered.resolve('LOGINDONE')
        loginPage.close()
    }
}
window.addEventListener("message", loginDoneListener)
