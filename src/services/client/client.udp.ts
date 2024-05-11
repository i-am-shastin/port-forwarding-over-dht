import DHT from "hyperdht";
import { Keychain } from "@services/keychain";
import { Streamable } from "@services/streamable";

export class UDPClient extends Streamable {
    public async init(dht: DHT, keychain: Keychain) {
    }

    protected pipeline(serverSocket: NodeJS.Socket): void {
        
    }
}