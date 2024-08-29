import type DHT from 'hyperdht';
import type { Keychain } from '~services/keychain';
import type { Gateway } from '~types';


export abstract class GatewayInstance {
    /**
     * Creates new gateway instance.
     */
    constructor(protected config: Gateway) {}

    /**
     * Initializes gateway instance.
     * @param dht DHT instance.
     * @param keychain Keychain to use.
     */
    public abstract init(dht: DHT, keychain: Keychain): Promise<void>;
}
