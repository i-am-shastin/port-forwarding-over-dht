import DHT from 'hyperdht';

import { ProtocolType } from '~enums';
import { Keychain } from '~services/keychain';
import { TCPClient, UDPClient } from '~services/node/client';
import { NodeInstance } from '~services/node/instance';
import { TCPServer, UDPServer } from '~services/node/server';
import { Configuration, Gateway } from '~types';
import { Console } from '~utils/console';


export class GatewayRunner {
    private dht = new DHT();
    private keychain: Keychain;

    constructor(private config: Configuration) {
        this.keychain = new Keychain(config.secret);
    }

    async run() {
        Console.debug('Awaiting DHT initialization');
        await this.dht.ready();

        let gateways = this.config.gateways;
        if (this.config.easy) {
            if (this.config.server) {
                await this.createConfigurationServer();
            } else {
                gateways = await this.readConfigurationFromServer();
            }
        }

        const instances = gateways.map((gateway) => {
            const instance = this.config.server
                ? this.createServer(gateway)
                : this.createClient(gateway);

            return instance.init(this.dht, this.keychain);
        });

        await Promise.allSettled(instances);
    }

    private createServer(config: Gateway): NodeInstance {
        switch (config.protocol) {
            case ProtocolType.UDP:
                return new UDPServer(config);
            case ProtocolType.TCP:
                return new TCPServer(config);
        }
    }

    private createClient(config: Gateway): NodeInstance {
        switch (config.protocol) {
            case ProtocolType.UDP:
                return new UDPClient(config);
            case ProtocolType.TCP:
                return new TCPClient(config);
        }
    }

    private async createConfigurationServer() {
        Console.debug('Starting easy configuration server');
        const server = this.dht.createServer({ reusableSocket: true }, (socket) => {
            Console.info('New client connected, sending gateways configuration');
            socket.write(JSON.stringify(this.config.gateways));
        });
        await server.listen(this.keychain.baseKeyPair);
    }

    private readConfigurationFromServer(): Promise<Gateway[]> {
        Console.debug('Requesting configuration from server');
        return new Promise((resolve) => {
            const socket = this.dht.connect(this.keychain.baseKeyPair.publicKey, { reusableSocket: true });
            socket.on('message', (buffer: string) => {
                Console.info('Received gateways configuration from server');
                const gateways = JSON.parse(buffer) as Gateway[];
                resolve(gateways);
            });
        });
    }
}
