import { createServer } from 'net';
import { pipeline } from 'stream';

import { GatewayInstance } from '~services/gateway/instance';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { Keychain } from '~services/keychain';


export class TCPClient extends GatewayInstance {
    /** @inheritdoc */
    public init(dht: DHT, keychain: Keychain) {
        const server = createServer({ allowHalfOpen: true }, (clientSocket) => {
            Console.debug(`New local TCP connection on port ${this.config.port}`);
            const socket = dht.connect(keychain.keyFor(this.config).publicKey, { reusableSocket: true });
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
