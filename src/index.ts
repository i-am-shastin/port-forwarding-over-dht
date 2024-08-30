import { program } from 'commander';
import DHT from 'hyperdht';

import packageData from '~package';
import { ConfigurationBuilderFactory } from '~services/config/builder-factory';
import { GatewayFactory } from '~services/gateway/factory';
import { GatewayResolver } from '~services/gateway/resolver';
import { Keychain } from '~services/keychain';
import { validate, write } from '~utils/configuration';
import { Console } from '~utils/console';

import type { ProgramOptions } from '~types';


program
    .name(packageData.name)
    .version(packageData.version)
    .argument('[secret]', 'secret phrase used to connect between server and client')
    .option('-r, --random', 'use randomly generated secret')
    .option('-c, --config <filename>', 'read configuration from file')
    .option('-g, --gateways <[ip-]tcp|udp:number>', 'comma-separated list of [host-]protocol:port', (v) => v.split(','))
    .option('-s, --server', 'start in server mode (otherwise client mode will be used)')
    .option('-e, --easy', 'use easy mode for gateway configuration exchanging')
    .option('-o, --output <filename>', 'save resulting configuration to file')
    .option('-d, --debug', 'verbose output')
    .action(main)
    .parse();

async function main(secret: string, options: ProgramOptions) {
    Console.debug(`Starting ${packageData.name} v${packageData.version}`);

    const configurationBuilder = ConfigurationBuilderFactory.createBuilder(secret, options);
    const [configurationLike, output] = await configurationBuilder.build();

    const validateResult = validate(configurationLike);
    if (!validateResult.success) {
        Console.critical(validateResult.error);
        process.exit(-1);
    }

    const configuration = validateResult.data;
    Console.debug(`Using configuration:\n${JSON.stringify(configuration, null, 4)}`);
    if (output) {
        await write(configuration, output);
    }

    const stopSpinner = Console.spinner('Initializing...');

    const dht = new DHT();
    Console.debug('Awaiting DHT initialization');
    await dht.ready();

    const keychain = new Keychain(configuration.secret);
    const resolver = new GatewayResolver(dht, keychain.baseKeyPair, configuration);

    const factory = new GatewayFactory(dht, keychain, resolver);
    await factory.start(configuration.server);

    stopSpinner();
    Console.info(`${packageData.name} started. Running ${factory.instanceCount} ${configuration.server ? 'server' : 'client'} gateway(s)`);
}
