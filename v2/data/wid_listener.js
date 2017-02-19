// Web browser IDentity management API
// wid_request Request to generate ID Assertion
// wid_response Response with ID Assertion
// wid_error Error in ID Assertion Request
// widp_register Request to register an IdP card

// Listen from page script
window.addEventListener("message", function(event){
  if(event.data.type == "wid_request"){
    connect_api(event.origin, event.data.request)
    .then(response => {
        if(response.error){
            console.error(response.error)
            window.postMessage({type:"wid_error", 'response':response.error}, response.origin)
        } else {
            window.postMessage({type:"wid_response", 'response':JSON.parse(atob(response.token)).assertion}, response.origin)
        }
    })
  } else if (event.data.type == "widp_register"){
    self.port.emit('widp_register', event.data.request)
  }
}, false);


// Transmit ID Assertion Request
function connect_api(origin, params){
    return new Promise(function(resolve, reject){
        //emit request
        params.origin = origin
        self.port.emit('wid_request', params)
        //get result
        self.port.on('wid_response', function(response){
            resolve(response)
        })
    })
}

