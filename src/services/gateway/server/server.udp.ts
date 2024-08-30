import { createSocket } from 'dgram';

import { BaseServer } from '~services/gateway/server/server.base';

import type { NoiseSecretStream } from 'hyperdht';


export class UDPServer extends BaseServer {
    protected reusableSocket = false;

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
