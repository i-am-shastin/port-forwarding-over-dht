import DHT, { NoiseSecretStream } from 'hyperdht';

import { Keychain } from '~services/keychain';
import { NodeInstance } from '~services/node/instance';
import { Console } from '~utils/console';


export abstract class BaseServer extends NodeInstance {
    protected abstract reusableSocket: boolean;

    public async init(dht: DHT, keychain: Keychain) {
        const protocol = this.config.protocol.toString().toUpperCase();
        const server = dht.createServer({ reusableSocket: this.reusableSocket }, (stream) => {
            Console.info(`New remote ${protocol} connection on port ${this.config.port}`);
            this.createConnection(stream);
        });

        const keyPair = keychain.get(this.config);
        await server.listen(keyPair);
        Console.debug(`Listening for remote ${protocol} connections on port ${this.config.port}`);
    }

    protected abstract createConnection(stream: NoiseSecretStream): void;
}
