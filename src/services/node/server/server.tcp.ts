import { connect } from 'net';
import { pipeline } from 'stream';

import { NoiseSecretStream } from 'hyperdht';

import { BaseServer } from '~services/node/server/server.base';


export class TCPServer extends BaseServer {
    reusableSocket = true;

    protected createConnection(stream: NoiseSecretStream): void {
        const socket = connect({
            port: this.config.port,
            host: this.config.host,
            allowHalfOpen: true
        });
        pipeline(stream, socket, stream);
    }
}
