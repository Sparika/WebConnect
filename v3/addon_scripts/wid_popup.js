const IDENTITIES = [
  {
    id: 1,
    iss: 'energyq.idp.rethink.orange-labs.fr',
    sub: 'bob@idp.com',
    picture: 'http://placehold.it/350x350',
    name: 'Mr. Bob',
    proxy: 'rethink-oidc'
  },
  {
    id: 2,
    iss: 'oidc.rethink.orange-labs.fr',
    sub: 'frank@dt.de',
    picture: 'http://placehold.it/250x250',
    name: 'Frank',
    proxy: 'rethink-oidc'
  }
];

function route(route, id){
    console.log("routing")
    switch(route){
    case "dashboard":
        console.log('dashboard')
        var html    = Handlebars.templates.dashboard({identities: IDENTITIES});
        document.getElementById("app").innerHTML = html
    break;
    case "select":
        console.log('select')
        var html    = Handlebars.templates.select({identities: IDENTITIES});
        document.getElementById("app").innerHTML = html
    break;
    case "selected":
        console.log('selected '+id)
    break;
    case "search":
    break;
    case "details":
        var html    = Handlebars.templates.dashboard({identity: IDENTITIES[id]});
        document.getElementById("app").innerHTML = html
    break;
    default: //#select or #add={idp...}
        addon.port.emit("hash", location.hash)
    }

    return false;
}

//route('dashboard',0)