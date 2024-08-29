import { createSocket } from 'dgram';

import { GatewayInstance } from '~services/gateway/instance';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { Keychain } from '~services/keychain';


export class UDPClient extends GatewayInstance {
    /** @inheritdoc */
    public init(dht: DHT, keychain: Keychain) {
        const stream = dht.connect(keychain.keyFor(this.config).publicKey);
        stream.on('open', () => {
            const socket = createSocket('udp4', (buffer) => {
                void stream.rawStream.send(buffer);
            });
            socket.bind(this.config.port);

            stream.rawStream.on('message', (buffer: Buffer) => {
                socket.send(buffer);
            });
        });

        Console.debug(`Listening for local UDP connections on port ${this.config.port}`);
        return Promise.resolve();
    }
}
