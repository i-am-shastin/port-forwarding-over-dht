import { createSocket } from 'node:dgram';

import { BaseClient } from '~services/gateway/client/client.base';

import type { NoiseSecretStream } from 'hyperdht';


export class UDPClient extends BaseClient {
    protected reusableSocket = false;

    protected createConnection(stream: NoiseSecretStream): void {
        const socket = createSocket({ type: 'udp4', reuseAddr: true }, (buffer) => {
            void stream.rawStream.send(buffer);
        });
        stream.rawStream.on('message', (buffer: Buffer) => {
            socket.send(buffer, this.config.port, this.config.host);
        });

        socket
            .on('listening', () => this.onListen())
            .on('connect', () => this.onConnect())
            .bind(this.config.port, this.config.host);
    }
}
