import { ProtocolType } from '~enums';
import { TCPClient, UDPClient } from '~services/gateway/client';
import { TCPServer, UDPServer } from '~services/gateway/server';
import { Console } from '~utils/console';

import type DHT from 'hyperdht';
import type { GatewayInstance } from '~services/gateway/instance';
import type { GatewayResolver } from '~services/gateway/resolver';
import type { Keychain } from '~services/keychain';
import type { Gateway } from '~types';


export class GatewayFactory {
    private instances!: GatewayInstance[];

    get instanceCount() {
        return this.instances.length;
    }

    /**
     * Initializes new gateway factory.
     * @param dht DHT instance.
     * @param keychain Keychain to use.
     * @param resolver Gateway resolver.
     */
    constructor(private dht: DHT, private keychain: Keychain, private resolver: GatewayResolver) {
    }

    /**
     * Starts gateways.
     * @param isServer Whether to start server or client gateways. Defaults to ```false```.
     */
    async start(isServer = false) {
        try {
            const gateways = await this.resolver.resolve();
            this.instances = gateways.map(isServer ? this.createServer : this.createClient);

            const initPromises = this.instances.map((instance) => instance.init(this.dht, this.keychain));
            await Promise.allSettled(initPromises);
        } catch (error) {
            Console.critical(String(error));
            process.exit(-3);
        }
    }

    private createServer(this: void, gateway: Gateway) {
        switch (gateway.protocol) {
            case ProtocolType.UDP:
                return new UDPServer(gateway);
            case ProtocolType.TCP:
                return new TCPServer(gateway);
        }
    }

    private createClient(this: void, gateway: Gateway) {
        switch (gateway.protocol) {
            case ProtocolType.UDP:
                return new UDPClient(gateway);
            case ProtocolType.TCP:
                return new TCPClient(gateway);
        }
    }
}
