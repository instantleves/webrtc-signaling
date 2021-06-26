import { v4 as uuid } from "uuid";
import { EventEmitter } from "events";
import MessageType from "./MessageType";
import Connection from "./interfaces/Connection";
import ErrorType from "./ErrorType";

declare interface WebRTCSignaling {
	on(event: "connection", listener: (peer: RTCPeerConnection) => void): this;
	on(event: "error", listener: (error: ErrorType) => void): this;
	on(event: "open", listener: () => void): this;
	on(event: string, listener: () => void): this;
}

class WebRTCSignaling extends EventEmitter {
	connections: Connection[] = [];
	private socket: WebSocket;
	private configuration = {
		iceServers: [
			{ urls: "stun:stun.l.google.com:19302" },
			{
				urls: "turn:turn.webrtc-signaling.tk:3478",
				username: "free",
				credential: "free"
			}
		],
		iceCandidatePoolSize: 10
	};

	/**
	 * Create instance of WebRTCSignaling
	 * @param id peer id, if leave empty automatically generate with uuid package
	 * @param url signaling websocket server url, if leave empty use the default free server
	 */
	constructor(public id?: string, url = "wss://server.webrtc-signaling.tk/") {
		super();

		if (!this.id) this.id = uuid();

		this.socket = new WebSocket(url + this.id);
		this.socket.addEventListener("close", this.handleClose.bind(this));
		this.socket.addEventListener("open", this.handleOpen.bind(this));
	}

	private handleClose(event: CloseEvent) {
		if (event.code == 4050) this.emit("error", ErrorType.ID_BUSY);
	}

	private handleOpen() {
		this.emit("open");
		this.socket.addEventListener("message", this.handleMessage.bind(this));
	}

	private async handleMessage(event: MessageEvent) {
		const data = JSON.parse(event.data);

		switch (data.type) {
			case MessageType.OFFER: {
				const peer = new RTCPeerConnection(this.configuration);
				this.emit("connection", peer);
				this.addConnection(data.from, peer);

				peer.addEventListener("negotiationneeded", async () => {
					peer.setRemoteDescription(new RTCSessionDescription(data.data));
					const answer = await peer.createAnswer();
					await peer.setLocalDescription(answer);

					this.send(data.from, MessageType.ANSWER, answer);
				});
				break;
			}
			case MessageType.ANSWER: {
				const connection = this.getConnection(data.from);
				if (connection) {
					connection.peer.setRemoteDescription(
						new RTCSessionDescription(data.data)
					);
				}
				break;
			}
			case MessageType.CANDIDATE: {
				const connection = this.getConnection(data.from);
				if (connection) connection.peer.addIceCandidate(data.data);
				break;
			}
			case MessageType.ERROR: {
				this.emit("error", data.code);
			}
		}
	}

	/**
	 * Connect to remote peer with id, if id does not exist emit the error event
	 * @param id remote peer id
	 * @return full usable RTCPeerConnection
	 */
	connect(id: string): RTCPeerConnection {
		const peer = new RTCPeerConnection(this.configuration);

		peer.addEventListener("negotiationneeded", async () => {
			const offer = await peer.createOffer();
			await peer.setLocalDescription(offer);

			this.addConnection(id, peer);

			this.send(id, MessageType.OFFER, offer);
		});

		peer.addEventListener("icecandidate", event => {
			if (event.candidate)
				this.send(id, MessageType.CANDIDATE, event.candidate);
		});

		return peer;
	}

	private addConnection(id: string, peer: RTCPeerConnection) {
		const connection: Connection = {
			id,
			peer
		};
		this.connections.push(connection);
	}

	private getConnection(id: string): Connection | null {
		const connection: Connection | null =
			this.connections.find(item => item.id === id) ?? null;
		return connection;
	}

	private send(id: string, type: MessageType, data: unknown) {
		const message = {
			to: id,
			type,
			data
		};
		this.socket.send(JSON.stringify(message));
	}
}

export default WebRTCSignaling;
