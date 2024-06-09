import { createSocket } from 'dgram';

import DHT, { NoiseSecretStream } from 'hyperdht';

import { Keychain } from '~services/keychain';
import { NodeInstance } from '~services/node/instance';
import { Console } from '~utils/console';


export class UDPClient extends NodeInstance {
    public async init(dht: DHT, keychain: Keychain) {
        const socket = dht.connect(keychain.get(this.config).publicKey);
        socket.on('open', () => this.createConnection(socket));
        Console.debug(`Listening for local UDP connections on port ${this.config.port}`);
    }

    private createConnection(stream: NoiseSecretStream) {
        const server = createSocket('udp4');
        server.on('message', (buffer) => {
            stream.rawStream.send(buffer);
        });
        stream.rawStream.on('message', (buffer) => {
            server.send(buffer, this.config.port);
        });
        server.bind(this.config.port);
    }
}
