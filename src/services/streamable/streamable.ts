import DHT from "hyperdht";
import { Keychain } from "@services/keychain";

export abstract class Streamable {
    constructor(protected config: NodeConfig) {}

    public abstract init(dht: DHT, keychain: Keychain): Promise<void>;
    protected abstract pipeline(stream: NoiseSecretStream): void;
}