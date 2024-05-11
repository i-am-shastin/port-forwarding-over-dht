import DHT, { DHTServerOptions } from "hyperdht";
import { Streamable } from "@services/streamable";
import { Keychain } from "@services/keychain";


export abstract class BaseServer extends Streamable {
    abstract serverOptions: DHTServerOptions;

    public async init(dht: DHT, keychain: Keychain) {
        const protocol = this.config.protocol.toString().toUpperCase();
        const server = dht.createServer(
            this.serverOptions,
            stream => {
                console.debug(`Incoming ${protocol} connection on port ${this.config.port}.`);
                this.pipeline(stream);
            }
        );
        console.debug(`Listening for remote ${protocol} connections on port ${this.config.port}.`);

        const keyPair = keychain.get(this.config.protocol, this.config.port);
        await server.listen(keyPair);
    }

    protected abstract pipeline(stream: NoiseSecretStream): void;
}