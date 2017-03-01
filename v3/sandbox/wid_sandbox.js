function getIdentityAssertion(iss, proxy){
    var pc = new RTCPeerConnection()
    pc.setIdentityProvider(iss, proxy)
    return pc.getIdentityAssertion()
}

window.addEventListener('message', function(event) {
    console.log(event.data)
    getIdentityAssertion(event.data.iss, event.data.proxy)
    .then(assertion => {
        event.source.postMessage({'type':'sandbox_assertion', 'assertion': assertion}, event.origin);
    })
    .catch(error => {
        console.error(error)
        event.source.postMessage({'type':'sandbox_error', 'error': error.message}, event.origin);
    })
})