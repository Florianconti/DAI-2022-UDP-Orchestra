import dgram from "dgram"
import net from "net"

const instruments = [
	["ti-ta-ti", "piano"],
	["pouet", "trumpet"],
	["trulu", "flute"],
	["gzi-gzi", "violin"],
	["boum-boum", "drum"]
]

const PROTOCOL = {
	MULTICAST_ADDRESS: "239.255.22.5",
	PORT: 9907,
	TIMEOUT: 5000,
	TCP_PORT: 2205,
	INSTRUMENTS: new Map(instruments)
}

const socket = dgram.createSocket("udp4")
let musicians = new Map()

socket.bind(PROTOCOL.PORT, () => {
	console.log("Joining multicast group on address: " + PROTOCOL.MULTICAST_ADDRESS)
	socket.addMembership(PROTOCOL.MULTICAST_ADDRESS)
})

socket.on('message', function(msg, source) {
	const {uuid, sound} = JSON.parse(msg)

	let date = Date.now()

	musicians.set(uuid, {uuid: uuid, instrument: PROTOCOL.INSTRUMENTS.get(sound), activeSince: (musicians.has(uuid) ? musicians.get(uuid).activeSince : date), lastActive: date})

	console.log("Musician with uuid : " + uuid + " send sound: " + sound + " from port: " + source.port)
});

const server = net.createServer()

server.listen(PROTOCOL.TCP_PORT, () => {
	console.log("TCP server is running on port " + PROTOCOL.TCP_PORT + "...")
}).on('connection', (conn) => {
	console.log("CONNECTED: " + conn.remoteAddress + ":" + conn.remotePort)

	const now = Date.now()
	const res = Array.from(musicians.entries()).filter(([uuid, musician]) => {
		let inactive = now - musician.lastActive > PROTOCOL.TIMEOUT
		if(inactive) {
			musicians.delete(uuid)
		}
		return !inactive
	}).map(([uuid, musician]) => ({
		uuid,
		instrument: musician.instrument,
		activeSince: new Date(musician.activeSince)
	}))

	conn.write(JSON.stringify(res))

	conn.end()
}).on('error', (conn) => {
	console.log("Error : ", conn);
});