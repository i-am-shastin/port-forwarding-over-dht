import { createSocket } from 'dgram';

import { NoiseSecretStream } from 'hyperdht';

import { BaseServer } from '~services/node/server/server.base';


export class UDPServer extends BaseServer {
    reusableSocket = false;

    protected createConnection(stream: NoiseSecretStream): void {
        const socket = createSocket('udp4', (buffer) => {
            void stream.rawStream.send(buffer);
        });
        socket.connect(this.config.port, this.config.host);

        stream.rawStream.on('message', (buffer: Buffer) => {
            socket.send(buffer);
        });
    }
}
