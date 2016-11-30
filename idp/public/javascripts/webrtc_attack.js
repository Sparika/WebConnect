'use strict';

var isChannelReady = true;
var isInitiator = false;
var isStartedA = false;
var isStartedB = false;
var startingA = false;
var startingB = false;
var localStream;
var pc;
var aliceStream;
var bobStream;
var turnReady;

var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

/////////////////////////////////////////////

//Listen to webrtc chatroom
var room = "webrtc"

if (room !== '') {
  console.log('Create or join room', room);
  socket.emit('create or join', room);
}

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
var pcA
var pcB

function startUserMedia(){
	var constraints = {video: true};
	getUserMedia(constraints, handleUserMedia, handleUserMediaError);
	console.log('Getting user media with constraints', constraints);
}

function listenAlice(){
    if (!isStartedA && isChannelReady && !startingB) {
		startingA = true
      createPeerConnection();
	  pc.addStream(localStream);
//	  pc.createDataChannel("");
	  pcA = pc
      isStartedA = true
      doCall();
    }
}

function listenBob(){
    if (!isStartedB && isChannelReady && !startingA) {
		startingB = true
      createPeerConnection();
	  pc.addStream(localStream);
//	  pc.createDataChannel("");
	  pcB = pc
      isStartedB = true
      doCall();
    }
}

function thanks(){
	sendMessage('thanks')
}
////////////////////////////////////////////////
//				WEBRTC CONTROL				  //
////////////////////////////////////////////////
function sendMessage(message){
	console.log('Client sending message: ', message);
//	message.from = "drevil";
	socket.emit('webrtc_attack', message);
}

socket.on('webrtc_attack', function (message){
  console.log('Client received message:', message);
  
  if (message.type === 'offer') {
    // Don't receive offer
  } else if (message.type === 'answer' && (startingA || startingB)) {
	  console.log("Set remote des")
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && (startingA || startingB)) {
	  console.log("add Ice candidate")
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && (isStartedA || isStartedB)) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////
//					USER MEDIA					  //
////////////////////////////////////////////////////
var aliceVideo = document.querySelector('#alice');
var bobVideo = document.querySelector('#bob');

function handleUserMedia(stream) {
  console.log('Adding local stream.');
  //bobVideo.src = window.URL.createObjectURL(stream);
  localStream = stream;
}

function handleUserMediaError(error){
  console.log('getUserMedia error: ', error);
}


if (location.hostname != "localhost") {
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}

//window.onbeforeunload = function(e){
//	sendMessage('bye');
//}

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

function handleCreateOfferError(event){
  console.log('createOffer() error: ', e);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, RTCPeerConnectionErrorCallback, sdpConstraints);
  
  //At this point it's established (?)
  startingA = startingB = false
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

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  if(startingA){
	  alice.src = window.URL.createObjectURL(event.stream);
  	  aliceStream = event.stream;
  }
  else if(startingB){
	  bob.src = window.URL.createObjectURL(event.stream);
  	  bobStream = event.stream;
  	
  }
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
}

function handleRemoteHangup() {
	console.log('Session terminated.');
	stop();
}

function stop() {
  isStartedA = isStartedB = false;
  isInitiator = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pcA.close();
  pcB.close();
  pcA = null;
  pcB = null;
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

