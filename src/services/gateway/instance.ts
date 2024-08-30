import { Console } from '~utils/console';

import type { DHTError, KeyPair, NoiseSecretStream } from 'hyperdht';
import type DHT from 'hyperdht';
import type { Gateway } from '~types';


export abstract class GatewayInstance {
    protected reusableSocket = true;

    /**
     * Creates new gateway instance.
     */
    constructor(public readonly config: Gateway) {}

    /**
     * Initializes gateway instance.
     * @param dht DHT instance.
     * @param keyPair Keypair to use.
     */
    public abstract init(dht: DHT, keyPair: KeyPair): Promise<void>;

    protected abstract createConnection(stream: NoiseSecretStream): void;

    protected handleStreamErrors(stream: NoiseSecretStream) {
        stream.on('error', (e: DHTError) => {
            if (e.code !== 'ETIMEDOUT') {
                Console.critical(String(e));
            } else {
                Console.debug(String(e));
            }
            stream.end();
        });
    }
}
