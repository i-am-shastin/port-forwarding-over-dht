import DHT from 'hyperdht';

import { ProtocolType } from '~enums';
import { Keychain } from '~services/keychain';
import { TCPClient, UDPClient } from '~services/node/client';
import { NodeInstance } from '~services/node/instance';
import { TCPServer, UDPServer } from '~services/node/server';
import { Configuration, Node } from '~types';


export class NodeFactory {
    private dht = new DHT();
    private keychain: Keychain;

    constructor(private config: Configuration) {
        this.keychain = new Keychain(config.secret);
    }

    async run() {
        await this.dht.ready();
        const nodes = this.config.nodes.map(
            (node) => {
                const instance = this.config.server
                    ? this.createServer(node)
                    : this.createClient(node);

                return instance.init(this.dht, this.keychain);
            }
        );
        await Promise.allSettled(nodes);
    }

    private createServer(node: Node): NodeInstance {
        switch (node.protocol) {
            case ProtocolType.UDP:
                return new UDPServer(node);
            case ProtocolType.TCP:
                return new TCPServer(node);
            default:
                throw new RangeError(`Unknown server protocol: "${node.protocol}"`);
        }
    }

    private createClient(node: Node): NodeInstance {
        switch (node.protocol) {
            case ProtocolType.UDP:
                return new UDPClient(node);
            case ProtocolType.TCP:
                return new TCPClient(node);
            default:
                throw new RangeError(`Unknown client protocol: "${node.protocol}"`);
        }
    }
}
