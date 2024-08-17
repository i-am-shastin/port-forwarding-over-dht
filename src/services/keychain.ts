import DHT, { Key, KeyPair } from 'hyperdht';

import { Gateway } from '~types';
import { Console } from '~utils/console';


/**
 * Keychain class used to generate keypairs for DHT connections.
 */
export class Keychain {
    public readonly baseKeyPair: KeyPair;

    /**
     * @param secret Secret phrase which will be used as base for keypairs.
     */
    constructor(private secret: string) {
        Console.debug(`Initializing keychain with secret: ${secret}`);
        this.baseKeyPair = this.keyPair(this.secret);
    }

    /**
     * Gets new keypair based on secret and gateway configuration.
     * @param gateway Gateway configuration
     */
    keyFor(gateway: Gateway): KeyPair {
        const seed = `${gateway.host ?? 'localhost'}-${gateway.protocol}:${gateway.port}`;
        Console.debug(`Generating keypair for gateway: ${seed}`);

        return this.keyPair(`${this.secret}-${seed}`);
    }

    private keyPair(input: string): KeyPair {
        const hash = this.hash(input);
        return DHT.keyPair(hash);
    }

    private hash(input: string): Key {
        return DHT.hash(Buffer.from(input));
    }
}
