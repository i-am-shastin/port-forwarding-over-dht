import { createSocket } from 'dgram';

import { GatewayInstance } from '~services/gateway/instance';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { Keychain } from '~services/keychain';


export class UDPClient extends GatewayInstance {
    /** @inheritdoc */
    public init(dht: DHT, keychain: Keychain) {
        return new Promise<void>((resolve) => {
            const stream = dht.connect(keychain.keyFor(this.config).publicKey);

            stream.once('open', () => {
                const socket = createSocket('udp4', (buffer) => {
                    void stream.rawStream.send(buffer);
                });
                socket.bind(this.config.port, this.config.host);

                stream.rawStream.on('message', (buffer: Buffer) => {
                    socket.send(buffer);
                });

                Console.debug(`Listening for local UDP connections on port ${this.config.port}`);
                resolve();
            });
        });
    }
}
