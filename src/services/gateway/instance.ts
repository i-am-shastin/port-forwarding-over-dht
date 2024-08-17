import DHT from 'hyperdht';

import { Keychain } from '~services/keychain';
import { Gateway } from '~types';


export abstract class GatewayInstance {
    constructor(protected config: Gateway) {}

    public abstract init(dht: DHT, keychain: Keychain): Promise<void>;
}
