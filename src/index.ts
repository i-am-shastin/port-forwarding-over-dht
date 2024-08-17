import { program } from 'commander';

import packageData from '~package';
import { ConfigurationBuilderFactory } from '~services/config/builder-factory';
import { GatewayRunner } from '~services/gateway/factory';
import { ProgramOptions } from '~types';
import { stringify, validate, write } from '~utils/configuration';
import { Console } from '~utils/console';


program
    .name(packageData.name)
    .version(packageData.version)
    .argument('[secret]', 'secret phrase used to connect between server and client')
    .option('-r, --random', 'use randomly generated secret')
    .option('-c, --config <filename>', 'read configuration from file')
    .option('-g, --gateways <[host-]tcp|udp:number>', 'comma-separated list of [host-]protocol:port', (v) => v.split(','))
    .option('-s, --server', 'start in server mode (otherwise client mode will be used)')
    .option('-e, --easy', 'server will send config to client so client doesn\'t need to provide anything but secret')
    .option('-o, --output <filename>', 'save resulting configuration to file')
    .option('-d, --debug', 'verbose output')
    .action(main)
    .parse();

async function main(secret: string, options: ProgramOptions) {
    Console.debug(`Starting ${packageData.name} v${packageData.version}`);

    const configurationBuilder = ConfigurationBuilderFactory.createBuilder(secret, options);
    const [configuration, output] = await configurationBuilder.build();

    const validateResult = validate(configuration);
    if (!validateResult.success) {
        Console.critical(validateResult.error);
        process.exit(-1);
    }

    const validConfiguration = validateResult.data;
    Console.debug(`Using configuration:\n${stringify(validConfiguration)}`);
    if (output) {
        await write(validConfiguration, output);
    }

    await new GatewayRunner(validConfiguration).run();
}
