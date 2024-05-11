import { DHTServerOptions } from "hyperdht";
import { BaseServer } from "./server.base";
import { createSocket } from "node:dgram";

export class UDPServer extends BaseServer {
    serverOptions: DHTServerOptions = {};
    
    protected pipeline(stream: NoiseSecretStream): void {
        const client = createSocket('udp4');
        client.connect(this.config.port, this.config.host);

        client.on('message', (buf) => {
            //stream.rawStream.send(buf);
        });
        stream.rawStream.on('message', buf => {
            //client.send(buf);
        });
    }
}