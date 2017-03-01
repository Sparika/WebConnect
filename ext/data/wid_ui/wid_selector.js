window.onhashchange = locationHashChanged;

var chooseMsg = "Choose an Identity to Use on ",
    displayMsg = "Identities Registered",
    chooseHelp = " requested a proof of authentication. Choose one of your identities or register a new one.",
    displayHelp = "You can add new identities from your identity provider website or manually from this panel."

function setHash(hash){
    window.location.hash = hash
}

function locationHashChanged(){
    switch(location.hash){
    case "#init":
        document.getElementById("selectDiv").style.display="block"
        document.getElementById("newDiv").style.display="none"
        document.getElementById("editDiv").style.display="none"
    break;
    case "#add":
        document.getElementById("selectDiv").style.display="none"
        document.getElementById("newDiv").style.display="block"
        document.getElementById("editDiv").style.display="none"
    break;
    case "#edit":
        document.getElementById("selectDiv").style.display="none"
        document.getElementById("newDiv").style.display="none"
        document.getElementById("editDiv").style.display="block"
    break;
    default: //#select or #add={idp...}
        addon.port.emit("hash", location.hash)
    }
}

//#init draw ID list
addon.port.on("init", function onShow(msg) {
  setHash("#init")
  if(msg.origin){
    document.getElementById("headerTitle").innerHTML = chooseMsg + msg.origin
    document.getElementById("headerDetails").innerHTML = msg.origin + chooseHelp
  }else{
    document.getElementById("headerTitle").innerHTML = displayMsg
    document.getElementById("headerDetails").innerHTML = displayHelp
  }
  //Clear
  var sarea = document.getElementById("select-area")
  while (sarea.lastChild) {
      sarea.removeChild(sarea.lastChild);
  }

  for(var key in msg.identities){
    addIdentityCard(msg.identities[key])
  }
})

function addIdentityCard(identity){
    var sarea = document.getElementById("select-area")

    var a = document.createElement("a")
    a.href = "javascript:setHash('#select="+identity.id+"');"

    var profileContainer = document.createElement("div")
    profileContainer.className = "profileContainer";
    var profileElt = document.createElement("div")
    profileElt.className = "profileElt round";
    var img = document.createElement("img")
    img.className = "round";
    img.src = identity.pic || "http://i.stack.imgur.com/wuYN2.jpg"
    //img.src= "resource://wid-ext/data/profilePic.png"
    profileElt.appendChild(img)
    profileContainer.appendChild(profileElt)

    profileElt = document.createElement("div")
    profileElt.className = "profileElt";
    var span = document.createElement("span")
    span.className = "profileName";
    span.innerHTML = identity.name
    profileElt.appendChild(span)
    profileElt.appendChild(document.createElement("br"))
    span = document.createElement("span")
    span.className = "profileDetails";
    span.innerHTML = identity.proxy.type
    profileElt.appendChild(span)
    profileElt.appendChild(document.createElement("br"))
    span = document.createElement("span")
    span.className = "profileDetails";
    span.innerHTML = identity.domain
    profileElt.appendChild(span)
    profileContainer.appendChild(profileElt)

    a.appendChild(profileContainer)

    sarea.appendChild(a)
}


// Search for IdP parameters
function searchIdpProxy(form){
    // TODO get OpenID Connect Configuration and look for IdP Proxy Informations
    var url = 'https://'+form.idp.value+'/.well-known/openid-configuration'
    var myInit = {method: 'GET'}
    fetch(url,myInit)
    .then(res => res.json())
    .then(json => {
        if(json && json.issuer && json.rtcProxy){
            var idp = {iss: json.issuer,
                       proxy:{type: json.rtcProxy}}

            addIdPInfoLine(idp)
        } else {
            throw new Error('IdP does not support RTCProxy')
        }
    })
    .catch(error => {
        console.error(error)
    })
return false
}

function addIdPInfoLine(idp){
    var rarea = document.getElementById("resultArea")
    while (rarea.lastChild) {
        rarea.removeChild(rarea.lastChild);
    }

    var a = document.createElement("a")
    a.href = "javascript:setHash('#add="+JSON.stringify(idp)+"');"

    var profileElt = document.createElement("div")
    profileElt.className = "profileElt";
    var span = document.createElement("span")
    span.innerHTML = "URL: "+idp.iss
    profileElt.appendChild(span)
    profileElt.appendChild(document.createElement("br"))
    span = document.createElement("span")
    span.innerHTML = "TYPE: "+idp.proxy.type
    profileElt.appendChild(span)
    a.appendChild(profileElt)

    rarea.appendChild(a)
}





