'use strict';

/******************************************************************************
								LOCAL STORAGE
******************************************************************************/
//
//const IDENTITIES = {
//  0: {
//    id: 0,
//    iss: 'energyq.idp.rethink.orange-labs.fr',
//    sub: 'bob@idp.com',
//    picture: 'http://placehold.it/350x350',
//    name: 'Mr. Bob',
//    proxy: 'rethink-oidc'
//  }
//};
var extStorage = browser.storage.local;

/************************************************************
/                PAGE CALL TO API
/***********************************************************/
function api_rcv(message, sender, sendResponse){
    switch (message.type) {
      case 'wid_request':
        return wid_request(message.request)
      break;
      case 'wid_register':
        return wid_register(message.request)
      break;
      default: console.log('Unknown API request')
    }
}


/************************************************************
/                IDP PROXY MANAGEMENT API
/***********************************************************/
function wid_register(identity){
    //Register new identity
    var id = identity.sub+"@"+identity.iss
    identity.id = id
    return extStorage.get('identities')
    .then(res => {
        if(!res.identities){
            res.identities = {}
        }
        res.identities[id] = identity
        return extStorage.set(res)
    })
}
function wid_registerGUID(request){
    //TODO Test if already set
    storage.guid = request.guid
}

var idSelectionRequest = {resolved: true,
                      resolve:null,
                      reject:null,
                      popupId:null
                     }
function wid_request(request){
    if(!idSelectionRequest.resolved){
        var popupId = idSelectionRequest.popupId
        idSelectionRequest.popupId = null
        idSelectionRequest.reject('New request')
        browser.windows.remove(popupId);
    }
    return browser.windows.create({'url': '/index.html#select', 'type': 'popup', 'width':300, 'height':500})
    // idSelectionRequest Promise
    .then(popup => {
        idSelectionRequest.popupId = popup.id
        return new Promise(function(resolve, reject){
            idSelectionRequest.resolve = resolve
            idSelectionRequest.reject = reject
            idSelectionRequest.resolved = false
      })
    })
}

function popup_rcv(message, sender, sendResponse){
    switch (message.type) {
        case 'popup_ready':
            return extStorage.get('identities')
        break;
        case 'popup_selected':
            browser.windows.remove(idSelectionRequest.popupId)
            idSelectionRequest.resolve(JSON.stringify(message.identity))
        break;
        case 'popup_close':
            idSelectionRequest.reject('Popup closed')
        break;
        default: console.log('Unknown Popup request')
    }
}

function popup_closed(windowId){
    if(windowId == idSelectionRequest.popupId){
        idSelectionRequest.resolves = true
        idSelectionRequest.reject('popup closed')
    }
}

browser.windows.onRemoved.addListener(popup_closed)
browser.runtime.onMessage.addListener(popup_rcv)
browser.runtime.onMessage.addListener(api_rcv)