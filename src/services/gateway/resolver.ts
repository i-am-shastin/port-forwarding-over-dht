import { Console } from '~utils/console';

import type { KeyPair } from 'hyperdht';
import type DHT from 'hyperdht';
import type { Configuration, Gateway } from '~types';


export class GatewayResolver {
    /**
     * Provides easy mode for gateway configuration exchanging.
     * @param dht DHT instance.
     * @param keypair Keypair to use.
     * @param config Program configuration.
     */
    constructor(private dht: DHT, private keypair: KeyPair, private config: Configuration) {
    }

    /**
     * Starts easy gateway configuration handler.
     * @returns Array of gateways to use.
     */
    async resolve() {
        if (this.config.server && this.config.easy) {
            Console.debug('Starting easy configuration server');
            await this.createConfigurationServer();
        }
        if (!this.config.server && this.config.gateways.length === 0) {
            Console.debug('Starting easy configuration client');
            return this.readConfigurationFromServer();
        }
        return this.config.gateways;
    }

    private async createConfigurationServer() {
        const server = this.dht.createServer({ reusableSocket: true }, (socket) => {
            Console.message('New client connected, sending gateways configuration');
            socket.end(JSON.stringify(this.config.gateways));
        });
        await server.listen(this.keypair);
    }

    private readConfigurationFromServer(): Promise<Gateway[]> {
        return new Promise((resolve, reject) => {
            const socket = this.dht.connect(this.keypair.publicKey, { reusableSocket: true });

            socket
                .once('error', reject)
                .once('data', (buffer: string) => {
                    Console.message('Received gateways configuration from server');
                    const gateways = JSON.parse(buffer) as Gateway[];

                    Console.debug(`Using gateways:\n${JSON.stringify(gateways, null, 4)}`);
                    resolve(gateways);
                });
        });
    }
}
