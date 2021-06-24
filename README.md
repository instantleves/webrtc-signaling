# WebRTC Signaling

## Install

Install with npm

```shell
npm install @davey2/webrtc-signaling
```

or include in browser

```html
<script src="https://unpkg.com/@davey2/webrtc-signaling"></script>
```

## Usage

Constructor

```javascript
const signaling = new WebRTCSignaling(/* optional id */);
```

Events

```javascript
signaling.on("open", () => {
	console.log(signaling.id);
	// output: random uuid
});

signaling.on("error", error => {
	// possible errors:
	// - "id-busy" - the id in the constructor is already taken
	// - "unavailable-id" - the id does not exist
	console.error(error);
});

// receive incoming connections
signaling.on("connection", peer => {
	// peer type is RTCPeerConnection
});
```

Connect

```javascript
const peer = signaling.connect("REMOTE-ID");
// peer type is RTCPeerConnection
// if the id is not exist, emit the error to error event listener
```
