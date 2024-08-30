import { GatewayInstance } from '~services/gateway/instance';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { KeyPair } from 'hyperdht';


export abstract class BaseClient extends GatewayInstance {
    /** @inheritdoc */
    public init(dht: DHT, keyPair: KeyPair) {
        return new Promise<void>((resolve) => {
            const stream = dht.connect(keyPair.publicKey, { reusableSocket: this.reusableSocket });

            this.handleStreamErrors(stream);
            stream.once('open', () => {
                this.createConnection(stream);
                resolve();
            });
        });
    }

    protected onListen() {
        Console.debug(`Listening for local ${this.config.protocol} connections on port ${this.config.port}`);
    }

    protected onConnect() {
        Console.debug(`New local ${this.config.protocol} connection on port ${this.config.port}`);
    }
}
