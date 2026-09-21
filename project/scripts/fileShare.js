// get elements and init variables
const hostCodeEl = document.getElementById('hostCode');
const joinKeyInput = document.getElementById('joinKey');
const joinBtn = document.getElementById('joinBtn');

// be ready to display the file that was uploaded to the uploader:
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', showChosenFile);

let hostPc = null;
let joinPc = null;
let hostKey = null;
let stopLooking = false;

// used to send data once connected
let activeDataChannel = null;




// set up listeners for when the connection opens and when a message arrives and from which client
// dc = data channel,
// label = HOST or JOIN

function setupListeners(dc, label) {
dc.onopen = () => {
console.log(`data channel open`);
stopLooking = true;
const closeBtn = document.getElementById('close-btn-con')
const ackBtn = document.getElementById('acknowledge-btn')
closeBtn.addEventListener('click', closeConPopup);
ackBtn.addEventListener('click', closeConPopup);
showConPopup();
};
// when a file arrives
dc.onmessage = (event) => {
   const message = JSON.parse(event.data);

   console.log('got file:', message.name);

   // convert the data back into a blob for downloading
   const bytes = new Uint8Array(message.data);
   //console.log(bytes)
   const blob = new Blob([bytes]);
   console.log(blob);

   // add a download link to the received files area
   const url = URL.createObjectURL(blob); // make a url
   // add the download link inside the <a> tag for the download in the popup
   const closeBtn = document.getElementById('close-btn-down')
   closeBtn.addEventListener('click', closeFilePopup);
   showFilePopup(message.name, url);
};






// set the active data channel to this one so that data can be sent using activeDataChannel
activeDataChannel = dc;
}


// waits for the ice gathering state to be complete
// if its not compleate yet it sets up a promise that resolves when the state changes to complete
// this is so that everything waits until its done getting the candidates before trying to use them

async function waitForIceGathering(pc) {
// if already done
if (pc.iceGatheringState === 'complete') {
   return;
}

// needs to wait. when the state changes, check if complete, if it is, resolve the promise and continue
await new Promise(resolve => {
   pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
      resolve();
      }
   };
});
}

// has to be an async function so that i can use await
async function initHost() {
try {
   hostPc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
   });

   // dc = data channel
   const dc = hostPc.createDataChannel('data');
   setupListeners(dc, 'HOST');

   // wait for ice candidates to be gathered
   const offer = await hostPc.createOffer();
   await hostPc.setLocalDescription(offer);
   await waitForIceGathering(hostPc);
   //console.log(hostPc.localDescription);

   // send session description (SDP) to server to get a key
   const res = await fetch('api/create_key.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp: hostPc.localDescription })
   });

   // wait for server to respond, then update the UI with the key
   const data = await res.json();
   hostKey = data.key;
   hostCodeEl.textContent = hostKey;

   checkAnswer();
} catch (error) {
   console.error(error);
}
}

async function checkAnswer() {
try {
   const res = await fetch(`api/get_answer.php?key=${hostKey}`);
   if (!res.ok) {
      // nobody answered yet, wait a second and call itself again to check again. 
      // (prob should change so its doesnt infinity call itself)
      // but it works so i wont
      if (!stopLooking){
      setTimeout(checkAnswer, 1000);
      return;
      }
      else {
      return;
      }
   }

   const data = await res.json();
   //console.log('recived data:', data);
   if (!data.sdp || !data.sdp.type) {
      setTimeout(checkAnswer, 1000);
      return;
   }

   await hostPc.setRemoteDescription(new RTCSessionDescription(data.sdp));
   // only shows success in console if nothing threw an error
   console.log('Success!');
   const closeBtn = document.getElementById('close-btn-con')
   const ackBtn = document.getElementById('acknowledge-btn')
   closeBtn.addEventListener('click', closeConPopup);
   ackBtn.addEventListener('click', closeConPopup);
   showConPopup();

} catch (error) {
   // if for some reason there is an error, just try it again in a second
   setTimeout(checkAnswer, 1000);
}
}


// functions for if someone enters a code to join instead of hosting


async function joinSession() {
// gets the key from the input box and trims whitespace
const key = joinKeyInput.value.trim();

// if no key then do nothing
if (!key) return;

try {
   // same logic as hosting, get all the the ice data

   joinPc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
   });

   // listen for when a data channel is set
   joinPc.ondatachannel = (event) => {
      // set up the listeners but for the recived data channel instead of created one
      setupListeners(event.channel, 'JOIN');
   };

   // fetch the offer using the key
   const res = await fetch(`api/get_offer.php?key=${key}`);
   if (!res.ok) {
      console.log('invalid offer key');
      console.log(res)
      return;
   }

   const data = await res.json();
   //console.log('offer data:', data);
   await joinPc.setRemoteDescription(new RTCSessionDescription(data.sdp));
   const answer = await joinPc.createAnswer();
   await joinPc.setLocalDescription(answer);

   // wait until gathering is complete
   await waitForIceGathering(joinPc);

   // send the answer back to the server
   await fetch(`api/post_answer.php?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp: joinPc.localDescription })
   });

   //console.log('answer sent');
} catch (error) {
   console.error(error);
}
}

// set up the join button to call the join function
joinBtn.onclick = joinSession;

// async function to send the file
sendFileBtn.onclick = async () => {
// if the connection is not open yet, do nothing
if (!activeDataChannel || activeDataChannel.readyState !== 'open') {
   alert('You need to be connected to send a file');
   return;
}

// get the first file from the input
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
if (!file) {
   alert('Pick a file first');
   return;
}

console.log('sending file:', file.name, file.size);


// create an array buffer that holds the data of the file, like length and a byte array of the data
const buffer = await file.arrayBuffer();
//console.log(new Uint8Array(buffer));

activeDataChannel.send(JSON.stringify({
   type: 'file',
   name: file.name,
   data: Array.from(new Uint8Array(buffer))  // turn the buffer into a typed array of unsigned 8 bit integers
}));

console.log('[SEND] file sent');
};

function showFilePopup(filename, url){
   const popup = document.getElementById('file-popup');
   const downloadLink = document.getElementById('file-download')

   downloadLink.href = url;
   downloadLink.download = filename;
   downloadLink.textContent = `${filename}`;

   popup.classList.remove('hidden');
}

function closeFilePopup(){
   const popup = document.getElementById('file-popup');
   const closeBtn = document.getElementById('close-btn-down')

   popup.classList.add('hidden');
   closeBtn.removeEventListener('click', closeFilePopup);
}

function showConPopup(){
   const popup = document.getElementById('connection-popup');
   
   popup.classList.remove('hidden');
}

function closeConPopup(){
   const popup = document.getElementById('connection-popup');
   const closeBtn = document.getElementById('close-btn-con');
   const ackBtn = document.getElementById('acknowledge-btn');

   popup.classList.add('hidden');
   closeBtn.removeEventListener('click', closeConPopup);
   ackBtn.removeEventListener('click', closeConPopup);
}

function showChosenFile(){
   const uploadBtn = document.getElementById('upload-btn');
   const fileInput = document.getElementById('fileInput');

   uploadBtn.textContent = fileInput.files[0].name;
}


// once page is loaded start hosting
window.addEventListener('DOMContentLoaded', initHost);