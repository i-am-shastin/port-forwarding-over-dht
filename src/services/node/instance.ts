import DHT from 'hyperdht';

import { Keychain } from '~services/keychain';
import { Node } from '~types';


export abstract class NodeInstance {
    constructor(protected config: Node) {}

    public abstract init(dht: DHT, keychain: Keychain): Promise<void>;
}
