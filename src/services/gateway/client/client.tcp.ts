import { createServer } from 'net';
import { pipeline } from 'stream';

import { BaseClient } from '~services/gateway/client/client.base';

import type { NoiseSecretStream } from 'hyperdht';


export class TCPClient extends BaseClient {
    protected createConnection(stream: NoiseSecretStream): void {
        const server = createServer({ allowHalfOpen: true }, (clientSocket) => {
            this.onConnect();
            pipeline(clientSocket, stream, clientSocket);
        });

        server.listen({ port: this.config.port, host: this.config.host }, () => this.onListen());
    }
}
