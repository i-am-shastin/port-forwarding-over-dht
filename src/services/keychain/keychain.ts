import DHT, { Key, KeyPair } from 'hyperdht';

import { Node } from '~types';
import { Console } from '~utils/console';


/**
 * Keychain class used to generate keypairs for DHT connections.
 * @param secret Secret phrase which will be used as base for keypairs.
 */
export class Keychain {
    private readonly _baseKeyPair: KeyPair;

    get baseKeyPair() {
        return this._baseKeyPair;
    }

    constructor(private secret: string) {
        Console.debug(`Initializing keychain with secret: ${secret}`);
        this._baseKeyPair = this.keyPair(this.secret);
    }

    /**
     * Gets new keypair based on secret and node configuration.
     */
    get(node: Node): KeyPair {
        const nodeAsString = `${node.host ?? 'localhost'}-${node.protocol}:${node.port}`;
        Console.debug(`Generating keypair for node: ${nodeAsString}`);

        return this.keyPair(`${this.secret}-${nodeAsString}`);
    }

    private keyPair(input: string): KeyPair {
        const hash = this.hash(input);
        return DHT.keyPair(hash);
    }

    private hash(input: string): Key {
        return DHT.hash(Buffer.from(input));
    }
}
