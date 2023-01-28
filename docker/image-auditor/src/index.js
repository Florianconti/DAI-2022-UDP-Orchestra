import dgram from "dgram"
import net from "net"

const socket = dgram.createSocket("udp4")

const entries = [
	["piano", "ti-ta-ti"],
	["trumpet", "pouet"],
	["flute", "trulu"],
	["violin", "gzi-gzi"],
	["drum", "boum-boum"]
]

const PROTOCOL = {
	MULTICAST_ADDRESS: "239.255.22.5",
	PORT: 9907,
	TCP_INTERFACE_ADDR: "0.0.0.0",
	TCP_INTERFACE_PORT: 2205,
	TIMEOUT: 4000,
	INSTRUMENTS: new Map([...entries].map(e => e.reverse()))
}

let musician = new Map();


socket.bind(PROTOCOL.PORT, function() {
	console.log("Joining multicast group");
	socket.addMembership(PROTOCOL.MULTICAST_ADDRESS);
});


socket.on('message', function(msg, source) {

	const {uuid, sound} = JSON.parse(msg)

	let instrument = PROTOCOL.INSTRUMENTS.get(sound)
	let date = Date.now()

	musician.set(uuid, {uuid: uuid, instrument: instrument, activeSince: musician.has(uuid) ? musician.get(uuid).activeSince : date, lastActive: date})

	console.log("Data has arrived " + msg + " Source port: " + source.port)
});

const server = net.createServer()

server.listen(PROTOCOL.TCP_INTERFACE_PORT, () => {
	console.log("TCP server is running on port " + PROTOCOL.TCP_INTERFACE_PORT)
}).on('connection', (conn) => {
	console.log("CONNECTED: " + conn.remoteAddress + ":" + conn.remotePort)

	const date = Date.now()
	const res = Array.from(musician.entries()).filter(([uuid, musician]) => {
		let removed = date - musician.lastActive > PROTOCOL.TIMEOUT
		if(removed) {
			musician.delete(uuid)
		}
		return !removed
	}).map(([uuid, musician]) => ({
		uuid,
		instrument: musician.instrument,
		activeSince: new Date(musician.activeSince)
	}))

	conn.write(JSON.stringify(res))

	conn.end()
}).on('error', (conn) => {
	console.log;
});