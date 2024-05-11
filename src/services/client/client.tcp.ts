import DHT from "hyperdht";
import { Keychain } from "@services/keychain";
import { Streamable } from "@services/streamable";
import { createServer } from "net";
import { pipeline } from "node:stream";

export class TCPClient extends Streamable {
    public async init(dht: DHT, keychain: Keychain) {
        const server = createServer({ allowHalfOpen: true }, (clientSocket) => {
            console.log(`Using ${this.config.port}.`);
            const keyPair = keychain.get(this.config.protocol, this.config.port);
            const socket = dht.connect(keyPair.publicKey, { reusableSocket: true });
            socket.on('open', () => {
                pipeline(clientSocket, socket, clientSocket);
            });
        });
        const socket = dht.connect(keychain.get(this.config.protocol, this.config.port).publicKey, { reusableSocket: true });
        socket.on('open', (d)=>{socket.write('test')})
        console.debug(`Listening for local TCP connections on port ${this.config.port}.`);

        server.listen(this.config.port, this.config.host);
    }

    protected pipeline(serverSocket: NodeJS.Socket): void {

    }
}