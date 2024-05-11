import DHT, { KeyPair } from 'hyperdht';

import { Node } from '~types';
import { Console } from '~utils/console';


/**
 * Keychain class used to generate keypairs for DHT connections.
 * @param secret Secret phrase which will be used as base for keypairs.
 */
export class Keychain {
    constructor(private secret: string) {
        Console.debug(`Initializing keychain with secret: ${secret}`);
    }

    /**
     * Gets new keypair based on secret and node configuration.
     */
    get(node: Node): KeyPair {
        const nodeAsString = `${node.host ?? 'localhost'}-${node.protocol}:${node.port}`;
        Console.debug(`Generating keypair for node: ${nodeAsString}`);

        const seed = `${this.secret}-${nodeAsString}`;
        const hash = DHT.hash(Buffer.from(seed));
        return DHT.keyPair(hash);
    }
}
