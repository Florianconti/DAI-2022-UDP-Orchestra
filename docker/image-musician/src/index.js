import { v4 as uuidv4 } from 'uuid'

import dgram from "dgram"

const dg = dgram.createSocket("udp4")

const instruments = [
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
	INSTRUMENTS: new Map(instruments)
}

let message = {
	uuid: uuidv4(),
	sound: PROTOCOL.INSTRUMENTS.get(process.argv[2])
};

let payload = JSON.stringify(message);

function sendInstrumentSound() {
	dg.send(payload, PROTOCOL.PORT, PROTOCOL.MULTICAST_ADDRESS, () => {
		console.log("Sending: " + payload + " from port: " + dg.address().port);
	});
}

sendInstrumentSound()

setInterval(sendInstrumentSound, 1000)