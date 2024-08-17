import DHT, { NoiseSecretStream } from 'hyperdht';

import { GatewayInstance } from '~services/gateway/instance';
import { Keychain } from '~services/keychain';
import { Console } from '~utils/console';


export abstract class BaseServer extends GatewayInstance {
    protected abstract reusableSocket: boolean;

    public async init(dht: DHT, keychain: Keychain) {
        const protocol = this.config.protocol.toString().toUpperCase();
        const server = dht.createServer({ reusableSocket: this.reusableSocket }, (stream) => {
            Console.info(`New remote ${protocol} connection on port ${this.config.port}`);
            this.createConnection(stream);
        });

        const keyPair = keychain.keyFor(this.config);
        await server.listen(keyPair);
        Console.debug(`Listening for remote ${protocol} connections on port ${this.config.port}`);
    }

    protected abstract createConnection(stream: NoiseSecretStream): void;
}
