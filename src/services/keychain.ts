import DHT from 'hyperdht';

import { Console } from '~utils/console';

import type { Key, KeyPair } from 'hyperdht';
import type { Gateway } from '~types';


export class Keychain {
    public readonly baseKeyPair: KeyPair;

    /**
     * Creates keychain to generate keypairs for DHT connections.
     * @param secret Secret phrase which will be used as base for keypairs.
     */
    constructor(private secret: string) {
        Console.debug(`Initializing keychain with secret: ${secret}`);
        this.baseKeyPair = this.createKeyPair(this.secret);
    }

    /**
     * Gets new keypair based on gateway configuration.
     * @param gateway Gateway configuration.
     */
    keyFor(gateway: Gateway): KeyPair {
        const seed = `${gateway.host ?? 'localhost'}-${gateway.protocol}:${gateway.port}`;
        Console.debug(`Generating keypair for gateway: ${seed}`);

        return this.createKeyPair(`${this.secret}-${seed}`);
    }

    private createKeyPair(seed: string): KeyPair {
        const hash = this.hash(seed);
        return DHT.keyPair(hash);
    }

    private hash(seed: string): Key {
        return DHT.hash(Buffer.from(seed));
    }
}
