import { createSocket } from 'node:dgram';

import { BaseServer } from '~services/gateway/server/server.base';

import type { NoiseSecretStream } from 'hyperdht';


export class UDPServer extends BaseServer {
    protected reusableSocket = false;

    protected createConnection(stream: NoiseSecretStream): void {
        const socket = createSocket({ type: 'udp4', reuseAddr: true }, (buffer) => {
            void stream.rawStream.send(buffer);
        });
        socket.connect(this.config.port, this.config.host);
        socket.once('listening', () => {
            const address = socket.address();
            stream.rawStream.on('message', (buffer: Buffer) => {
                socket.send(buffer, address.port, address.address);
            });
        });
    }
}
