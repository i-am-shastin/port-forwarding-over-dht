import DHT from 'hyperdht';
import { ConfigReader } from '@src/utils';
import { Keychain } from '@services/keychain';
import { NodeFactory } from '@services/node';


(async () => {
    const config = await ConfigReader.get(process.argv[2] as unknown as NodeType);

    const dht = new DHT();
    await dht.ready();

    const keychain = new Keychain(config.secret);
    config.nodes.map(async (n) => {
        const node = NodeFactory.create(n);
        await node.init(dht, keychain);
    });
})();