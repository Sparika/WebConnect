var self = require("sdk/self"),
    data = require("sdk/self").data,
    mod = require("sdk/page-mod"),
    storage = require("sdk/simple-storage").storage,
    xhr = require("sdk/net/xhr"),
    panel = require("sdk/panel"),
    base64 = require("sdk/base64"),
    hiddenFrames = require("sdk/frame/hidden-frame"),
    { Cu, Cc } = require("chrome"),
    { sandbox, evaluate, load } = require("sdk/loader/sandbox"),
    windows = require("sdk/windows").browserWindows

Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'IdpSandbox',
  'resource://gre/modules/media/IdpSandbox.jsm');
XPCOMUtils.defineLazyModuleGetter(this, "PeerConnectionIdp",
  "resource://gre/modules/media/PeerConnectionIdp.jsm");


//storage.identities = {}
//{
//    'bob@idp.com@energyq.idp.rethink.orange-labs.fr': {
//        name: 'Bob K.',
//        domain: 'energyq.idp.rethink.orange-labs.fr',
//        id: 'bob@idp.com@energyq.idp.rethink.orange-labs.fr',
//        proxy: {type: 'rethink-oidc'}
//    },
//    'simon@energyq.idp.rethink.orange-labs.fr': {
//        name: 'Simon',
//        domain: 'oidc-ns.kermit.orange-labs.fr',
//        id: 'simon@energyq.idp.rethink.orange-labs.fr',
//        proxy: {type: 'rethink-oidc-ns'}
//    }
//}

/************************************************
/           ID SELECTION UI
/***********************************************/
var wid_selector = panel.Panel({
  width: 300,
  height: 300,
  contentURL: data.url("wid_ui/wid_selector.html"),
  //contentScriptFile: data.url("wid_ui/wid_selector.js")
});

var wid_button = require("sdk/ui/button/toggle").ToggleButton({
  id: "btn_idSelector",
  label: "Identity Button",
  icon: {
    "16": "./icon16.png",
    "32": "./icon32.png",
    "64": "./icon64.png"
  },
  onClick: clk_idSelector
});


// Show the panel when the user clicks the button.
function clk_idSelector(state) {
  wid_selector.show({position: wid_button});
}
// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
wid_selector.on("show", function() {
  var msg = {identities: storage.identities, origin: currentRequest.origin}
  wid_selector.port.emit("init", msg);
});
wid_selector.on("hide", function() {
  wid_button.state('window', {checked: false});
  // Anyway or another, request completed
  currentRequest = {}
});

wid_selector.port.on("hash", function(msg) {
    console.error(msg)
  var params = msg.split(/=|#/)
  var response = {}
  response.origin = currentRequest.origin
  response.worker = currentRequest.worker
  var hash = params[1],
      value= params[2]
  switch(hash){
        case "select":{
            response.selected = storage.identities[params[2]]
        }
        break;
        case "add":{
            var idp = JSON.parse(decodeURIComponent(value))
            var splited = idp.iss.split(/https?\:\/\//)
            idp.iss = splited.length > 1? splited[1] : splited[0]
            response.selected = idp
            response.origin = "#add"
        }

  }
  widp_getIdentityAssertion(response)
});
/************************************************************
/                PAGE CALL TO API
/***********************************************************/
var currentRequest = {}
var pageMod = mod.PageMod({
  include: "*",
  contentScriptFile: self.data.url("wid_listener.js"),
  contentScriptWhen: "ready",
  onAttach: function(worker){
      worker.port.on("widp_register",function(params){
          widp_register(params)
      });
      worker.port.on("wid_request",function(request){
          currentRequest = request
          currentRequest.worker = worker
          doRequest()
      });
  }
})

function doRequest(){
    //Here we do stuff
    wid_selector.show({position: wid_button});
    // Ask user to select identity

    // Verify authorization (?)

    // Ask user to authorize
}

function sendResponse(response){
    if(response.origin == "#add" && !response.error){
        //TODO Verify received Token
        var payload = JSON.parse(base64.decode(JSON.parse(base64.decode(response.token)).assertion.split('.')[1]))
        console.error(response.selected.proxy)
        response.selected.sub = payload.sub
        response.selected.iss = payload.iss.split(/https?:\/\//)[1]
        widp_register(response.selected)
        var msg = {identities: storage.identities, origin: currentRequest.origin}
        wid_selector.port.emit("init", msg);
    } else if (response.origin == "#add" && response.error){
        console.error(response.error)




    } else {
        // Reply to origin with token
        var worker = response.worker
        response.worker = null
        worker.port.emit('wid_response', response)
        wid_selector.hide()
    }
}


/************************************************************
/                IDP PROXY MANAGEMENT API
/              USES PAGE CALL TO API WORKER
/***********************************************************/
function widp_register(params){
    //Init peerConnection with domain and type
    //var _idp = new IdpSandbox()

    //Register new identity
    var identity = {name: params.name||params.sub,
                    domain: params.iss,
                    id: params.sub+"@"+params.iss,
                    proxy: {type: params.proxy.type}
                   }
    storage.identities[identity.id] = identity
}


function widp_getIdentityAssertion(response){
    //For now we do it with WebRTC
    //TODO do it with own IdPSandbox
    var hiddenFrame = hiddenFrames.add(hiddenFrames.HiddenFrame({
    onReady: function() {
        this.element.contentWindow.location = "http://example.com/";
        let self = this;
        this.element.addEventListener("DOMContentLoaded", function() {
            var _idp = new PeerConnectionIdp(self.element.contentWindow)
            //init IdP Proxy
            _idp.setIdentityProvider((response.selected.domain||response.selected.iss),response.selected.proxy.type)

            _idp.getIdentityAssertion('content',response.origin)
            .then(token => {
                response.token = token
            })
            .catch(error => {
                response.error = error
                error.name == 'IdpLoginError' ? response.error.loginUrl = JSON.parse(error.message).loginUrl:0;
            })
            .then(() => {
                sendResponse(response)
            })
        }, true, true);
    }}));
}

function promiseLogin(loginUrl, hiddenFrame){
    var login_popup = panel.Panel({contentURL: loginUrl})
    //TODO Promise to login
    login_popup.show()
    //var login_popup = hiddenFrame.element.contentWindow.open(loginUrl)

    return new Promise(function(resolve, reject){
        login_popup.on('*', function(event){
            if(event == 'hide'){
                resolve(event)
            }
            //else
            //    reject(event)
        })
    })
}