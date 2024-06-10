import DHT from 'hyperdht';

import { ProtocolType } from '~enums';
import { Keychain } from '~services/keychain';
import { TCPClient, UDPClient } from '~services/node/client';
import { NodeInstance } from '~services/node/instance';
import { TCPServer, UDPServer } from '~services/node/server';
import { Configuration, Node } from '~types';
import { Console } from '~utils/console';


export class NodeFactory {
    private dht = new DHT();
    private keychain: Keychain;

    constructor(private config: Configuration) {
        this.keychain = new Keychain(config.secret);
    }

    async run() {
        await this.dht.ready();

        let nodes = this.config.nodes;
        if (!this.config.server && this.config.easy) {
            nodes = await this.readConfigurationFromServer();
        }

        const instances = nodes.map((node) => {
            const instance = this.config.server
                ? this.createServer(node)
                : this.createClient(node);

            return instance.init(this.dht, this.keychain);
        });

        if (this.config.server && this.config.easy) {
            await this.createConfigurationServer();
        }

        await Promise.allSettled(instances);
    }

    private createServer(node: Node): NodeInstance {
        switch (node.protocol) {
            case ProtocolType.UDP:
                return new UDPServer(node);
            case ProtocolType.TCP:
                return new TCPServer(node);
        }
    }

    private createClient(node: Node): NodeInstance {
        switch (node.protocol) {
            case ProtocolType.UDP:
                return new UDPClient(node);
            case ProtocolType.TCP:
                return new TCPClient(node);
        }
    }

    private async createConfigurationServer() {
        const server = this.dht.createServer({ reusableSocket: true }, (socket) => {
            Console.info('New client connected, sending node configuration');
            socket.write(JSON.stringify(this.config.nodes));
        });
        await server.listen(this.keychain.baseKeyPair);
    }

    private async readConfigurationFromServer(): Promise<Node[]> {
        return new Promise((resolve) => {
            const socket = this.dht.connect(this.keychain.baseKeyPair.publicKey, { reusableSocket: true });
            socket.on('message', (buffer: string) => {
                Console.info('Received node configuration from server');
                const nodes = JSON.parse(buffer) as Node[];
                resolve(nodes);
            });
        });
    }
}
