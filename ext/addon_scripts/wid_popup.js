var IDENTITIES = []

function route(route){
    var path = route.split('/')
    switch(path[0]){
    case "#dashboard":
        var html    = Handlebars.templates.dashboard({identities: IDENTITIES});
        document.getElementById("app").innerHTML = html
    break;
    case "#select":
        var html    = Handlebars.templates.select({identities: IDENTITIES});
        document.getElementById("app").innerHTML = html
    break;
    case "#selected":
        browser.runtime.sendMessage({type:"popup_selected", identity: IDENTITIES[path[1]]})
    break;
    case "#search":
        var html    = Handlebars.templates.search({})
    break;
    case "#details":
        var html    = Handlebars.templates.dashboard({identity: IDENTITIES[path[1]]});
        document.getElementById("app").innerHTML = html
    break;
    }
}

//****************************************************************
//                      ROUTING
//****************************************************************
window.onhashchange = function(){
    route(window.location.hash)
}

window.onbeforeunload = function() {
  browser.runtime.sendMessage({type:'popup_close'});
}

browser.runtime.sendMessage({type:"popup_ready"})
.then(res => {
    IDENTITIES = res.identities
    //reload
    route(window.location.hash)
})