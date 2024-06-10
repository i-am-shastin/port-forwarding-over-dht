import { createServer } from 'net';
import { pipeline } from 'stream';

import DHT from 'hyperdht';

import { Keychain } from '~services/keychain';
import { NodeInstance } from '~services/node/instance';
import { Console } from '~utils/console';


export class TCPClient extends NodeInstance {
    public async init(dht: DHT, keychain: Keychain) {
        const server = createServer({ allowHalfOpen: true }, (clientSocket) => {
            Console.debug(`New local TCP connection on port ${this.config.port}`);
            const socket = dht.connect(keychain.get(this.config).publicKey, { reusableSocket: true });
            socket.on('open', () => {
                pipeline(clientSocket, socket, clientSocket);
            });
        });

        server.listen({ port: this.config.port, host: this.config.host }, () => {
            Console.debug(`Listening for local TCP connections on port ${this.config.port}`);
        });

        return Promise.resolve();
    }
}
