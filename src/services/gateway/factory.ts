import DHT from 'hyperdht';

import { ProtocolType } from '~enums';
import { TCPClient, UDPClient } from '~services/gateway/client';
import { GatewayInstance } from '~services/gateway/instance';
import { TCPServer, UDPServer } from '~services/gateway/server';
import { Keychain } from '~services/keychain';
import { Configuration, Gateway } from '~types';
import { Console } from '~utils/console';


export class GatewayFactory {
    private dht = new DHT();
    private keychain: Keychain;
    private instances!: GatewayInstance[];

    get instanceCount() {
        return this.instances.length;
    }

    constructor(private config: Configuration) {
        this.keychain = new Keychain(config.secret);
    }

    async start() {
        Console.debug('Awaiting DHT initialization');
        const stopSpinner = Console.spinner('Initializing...');

        await this.dht.ready();
        await (this.config.server ? this.createServers() : this.createClients());

        const initPromises = this.instances.map((instance) => instance.init(this.dht, this.keychain));
        await Promise.allSettled(initPromises);

        stopSpinner();
    }

    private async createServers() {
        if (this.config.easy) {
            await this.createConfigurationServer();
        }

        this.instances = this.config.gateways.map((gateway) => {
            switch (gateway.protocol) {
                case ProtocolType.UDP:
                    return new UDPServer(gateway);
                case ProtocolType.TCP:
                    return new TCPServer(gateway);
            }
        });
    }

    private async createClients() {
        let gateways = this.config.gateways;
        if (!gateways.length) {
            gateways = await this.readConfigurationFromServer();
        }

        this.instances = gateways.map((gateway) => {
            switch (gateway.protocol) {
                case ProtocolType.UDP:
                    return new UDPClient(gateway);
                case ProtocolType.TCP:
                    return new TCPClient(gateway);
            }
        });
    }

    private async createConfigurationServer() {
        Console.debug('Starting easy configuration server');
        const server = this.dht.createServer({ reusableSocket: true }, (socket) => {
            Console.message('New client connected, sending gateways configuration');
            socket.write(JSON.stringify(this.config.gateways));
        });
        await server.listen(this.keychain.baseKeyPair);
    }

    private readConfigurationFromServer(): Promise<Gateway[]> {
        Console.debug('Requesting configuration from server');
        return new Promise((resolve) => {
            const socket = this.dht.connect(this.keychain.baseKeyPair.publicKey, { reusableSocket: true });
            socket.on('message', (buffer: string) => {
                Console.message('Received gateways configuration from server');
                const gateways = JSON.parse(buffer) as Gateway[];
                resolve(gateways);
            });
        });
    }
}
