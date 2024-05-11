import { Streamable } from "@services/streamable";
import { TCPServer, UDPServer } from "@services/server";
import { TCPClient, UDPClient } from "@services/client";


export class NodeFactory {
    static create(node: NodeConfig): Streamable {
        switch (node.type) {
            case NodeType.client:
                return this.createClient(node);
            case NodeType.server:
                return this.createServer(node);
            default:
                throw new RangeError(`Unknown node type: "${node.type}"`);
        }
    }

    private static createServer(node: NodeConfig): Streamable {
        switch (node.protocol) {
            case NodeProtocol.UDP:
                return new UDPServer(node);
            case NodeProtocol.TCP:
                return new TCPServer(node);
            default:
                throw new RangeError(`Unknown server protocol: "${node.protocol}"`);
        }
    }

    private static createClient(node: NodeConfig): Streamable {
        switch (node.protocol) {
            case NodeProtocol.UDP:
                return new UDPClient(node);
            case NodeProtocol.TCP:
                return new TCPClient(node);
            default:
                throw new RangeError(`Unknown client protocol: "${node.protocol}"`);
        }
    }
}