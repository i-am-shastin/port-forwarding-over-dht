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
        constructor(options: Partial<DHTNodeOptions> = {});

        ready(): Promise<void>;
        createServer(options: Partial<DHTServerOptions>, onconnection: (stream: NoiseSecretStream) => void): DHTServer;
        connect(remotePublicKey: Key, options?: DHTConnectionOptions): NoiseSecretStream;

        static keyPair(seed: Key): KeyPair;
        static hash(seed: Buffer): Key;
    }
}
