import { connect } from 'node:net';
import { pipeline } from 'node:stream';

import { BaseServer } from '~services/gateway/server/server.base';

import type { NoiseSecretStream } from 'hyperdht';


export class TCPServer extends BaseServer {
    protected createConnection(stream: NoiseSecretStream): void {
        const socket = connect({
            port: this.config.port,
            host: this.config.host,
            allowHalfOpen: true
        });
        pipeline(stream, socket, stream);
    }
}
