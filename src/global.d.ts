declare module 'hyperdht' {
    type Key = Buffer | Uint8Array;

    interface KeyPair {
        publicKey: Key;
        secretKey: Key;
    }

    interface DHTNodeOptions {
        host?: string;
        port?: number;
        bootstrap?: string[];

        keyPair?: KeyPair;
        seed?: string;

        connectionKeepAlive?: number;
    }

    interface DHTServerOptions {

    }

    interface DHTServer {
        async listen(keyPair: KeyPair): Promise<DHTServer>;
    }

    interface DHTConnectionOptions {
        reusableSocket?: boolean;
    }

    export default class DHT {
        constructor(options: DHTNodeOptions = {});

        static keyPair(seed: Key): KeyPair;
        static hash(seed: Buffer): Key;

        createServer(options: DHTServerOptions, onconnection: (stream: NoiseSecretStream) => void): DHTServer;
        ready(): Promise<void>;
        connect(remotePublicKey: Key, options?: DHTConnectionOptions): NodeJS.Socket;
        // remoteAddress(): { host: string, port: number };
    }
}

interface NoiseSecretStream extends NodeJS.ReadWriteStream {
    rawStream: NodeJS.ReadWriteStream;
}

const enum NodeType {
    server = 'server',
    client = 'client'
}

const enum NodeProtocol {
    TCP = 'tcp',
    UDP = 'udp'
}

interface NodeConfig {
    type: NodeType;
    protocol: NodeProtocol;
    port: number;
    host?: string;
}

interface Config {
    secret: string;
    nodes: NodeConfig[];
}