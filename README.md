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

```typescript
const signaling = new WebRTCSignaling(/* optional params */);

// constructor params:
// id: string, optional, default: generates with uuid
// url: string, optional, default: wss://server.webrtc-signaling.tk/
// rtcConfiguration: RTCConfiguration, optional, default:
/* {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{
			urls: "turn:turn.webrtc-signaling.tk:3478",
			username: "free",
			credential: "free"
		}
	],
	iceCandidatePoolSize: 10
} */
```

Events

```typescript
signaling.on("open", id => {
	console.log(id);
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

```typescript
const peer = signaling.connect("REMOTE-ID");
// peer type is RTCPeerConnection
// if the id is not exist, emit the error to error event listener
```
