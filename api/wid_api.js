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
/**
*   wid_connect
*   JSON request: parameters for the request in a JSON object. (future extension)
*   This function request a new ID Assertion from the extension to authenticate the user.
**/
function wid_connect (request){
    return new Promise((resolve, reject) => {
        function rcvResponse(event){
            if(event.data.type == 'wid_response'){
                resolve(event.data.response)
            }
            else if(event.data.type == 'wid_error'){
                reject(event.data.response)
            }
        }
		window.addEventListener("message", rcvResponse, false);
	    window.postMessage({type:"wid_request",request:request}, "*");
    })
}

/**
*   wid_register
*   String iss: the IdP domain name.
*   String proxy: the IdP proxy type.
*   String sub: the user subscriber identifier.
*   String name: the user display name.
*   String picture: the user picture URL
*   This function register an IdP Proxy in the WID Connect extension.
*   Following standard WebRTC, the proxy is available at https://domain/.well-known/idp-proxy/type
**/
function wid_register (iss, sub, proxy, name, picture){
    window.postMessage({type:"wid_register",request:{iss:iss, sub:sub, proxy:proxy, name:name, picture:picture}}, "*");
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