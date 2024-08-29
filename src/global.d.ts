declare module 'hyperdht' {
    type Key = Buffer | Uint8Array;

    interface KeyPair {
        publicKey: Key;
        secretKey: Key;
    }

    interface DHTNodeOptions {
        host: string;
        port: number;
        bootstrap: string[];

        keyPair: KeyPair;
        seed: string;

        connectionKeepAlive: number;
    }

    interface DHTConnectionOptions {
        reusableSocket?: boolean;
    }

    interface DHTServerOptions extends DHTConnectionOptions {
        firewall: (remotePublicKey, remoteHandshakePayload) => boolean;
    }

    interface DHTServer {
        listen(keyPair: KeyPair): Promise<DHTServer>;
    }

    interface UDXStream extends NodeJS.ReadWriteStream {
        send: (buffer: Buffer) => Promise<void>;
    }

    interface NoiseSecretStream extends NodeJS.ReadWriteStream {
        rawStream: UDXStream;
    }

    export default class DHT {
        /**
         * Creates new DHT node.
         */
        constructor(options: Partial<DHTNodeOptions> = {});

        /**
         * Returns promise that resolves after DHT node initialization.
         */
        ready(): Promise<void>;

        /**
         * Creates a new server for accepting incoming encrypted P2P connections.
         */
        createServer(options: Partial<DHTServerOptions>, onconnection: (stream: NoiseSecretStream) => void): DHTServer;

        /**
         * Connects to a remote server.
         */
        connect(remotePublicKey: Key, options?: DHTConnectionOptions): NoiseSecretStream;

        /**
         * Generates the required key pair for DHT operations.
         */
        static keyPair(seed: Key): KeyPair;

        /**
         * Generates the key for key pairs.
         */
        static hash(seed: Buffer): Key;
    }
}


declare module 'eslint-plugin-import' {
    import type { ESLint } from 'eslint';


    export default plugin as ESLint.Plugin;
}
