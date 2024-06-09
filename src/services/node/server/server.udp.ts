import { createSocket } from 'dgram';

import { NoiseSecretStream } from 'hyperdht';

import { BaseServer } from '~services/node/server/server.base';


export class UDPServer extends BaseServer {
    reusableSocket = false;

    protected createConnection(stream: NoiseSecretStream): void {
        const client = createSocket('udp4');
        client.connect(this.config.port, this.config.host);

        client.on('message', (buffer) => {
            stream.rawStream.send(buffer);
        });
        stream.rawStream.on('message', (buffer) => {
            client.send(buffer);
        });
    }
}
