import { DHTServerOptions } from "hyperdht";
import { BaseServer } from "./server.base";
import { connect } from "net";
import { pipeline } from "node:stream";

export class TCPServer extends BaseServer {
    serverOptions: DHTServerOptions = {
        reusableSocket: true
    };

    protected pipeline(stream: NoiseSecretStream): void {
        console.log(stream);
        const socket = connect({
            port: this.config.port,
            host: this.config.host,
            allowHalfOpen: true
        });
        pipeline(stream.rawStream, socket, stream.rawStream);
    }
}