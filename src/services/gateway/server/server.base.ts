import { GatewayInstance } from '~services/gateway/instance';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { DHTError, NoiseSecretStream } from 'hyperdht';
import type { Keychain } from '~services/keychain';


export abstract class BaseServer extends GatewayInstance {
    protected abstract reusableSocket: boolean;

    /** @inheritdoc */
    public async init(dht: DHT, keychain: Keychain) {
        const protocol = this.config.protocol.toString().toUpperCase();
        const server = dht.createServer({ reusableSocket: this.reusableSocket }, (stream) => {
            Console.info(`New remote ${protocol} connection on port ${this.config.port}`);
            this.createConnection(stream);
            stream.on('error', (e: DHTError) => {
                if (e.code !== 'ETIMEDOUT') {
                    Console.critical(String(e));
                } else {
                    Console.debug(String(e));
                }
                stream.end();
            });
        });

        const keyPair = keychain.keyFor(this.config);
        await server.listen(keyPair);
        Console.debug(`Listening for remote ${protocol} connections on port ${this.config.port}`);
    }

    protected abstract createConnection(stream: NoiseSecretStream): void;
}
