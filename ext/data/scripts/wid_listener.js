// Web browser IDentity management API
// wid_request Request to generate ID Assertion
// wid_response Response with ID Assertion
// wid_error Error in ID Assertion Request
// wid_register Request to register an IdP card

// Listen from page script
window.addEventListener("message", function(event){
    console.error(event.origin)
    console.error(event.data)
    console.error(event.data.request)
    connect_api(event.origin, event.data.type, event.data.request)
    .then(response => {
        if(response.error){
            console.error(response.error)
            window.postMessage({type:"wid_error", 'response':response.error}, response.origin)
        } else {
            if(event.data.type == 'wid_request')
                window.postMessage({type:"wid_response", 'response':JSON.parse(atob(response.token)).assertion}, response.origin)
            // else wid_register
            // else wid_guid
            console.log(event.data.type+' successful.')
        }
    })
}, false);


// Transmit ID Assertion Request
function connect_api(origin, type, request){
    request.origin = origin
    var p = new Promise((resolve, reject) => self.port.on('wid_response', resolve))
    self.port.emit(type, request)
    return p
}

