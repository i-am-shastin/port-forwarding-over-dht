import { program } from 'commander';

import packageData from '../package.json';

import { ConfigurationBuilder } from '~services/config/builder';
import { NodeFactory } from '~services/node/factory';
import { ProgramOptions } from '~types';
import { Console } from '~utils/console';
import { writeConfiguration } from '~utils/file';


program
    .name(packageData.name)
    .version(packageData.version)
    .argument('[secret]', 'secret phrase used to connect between server and client')
    .option('-g, --generate', 'use randomly generated secret')
    .option('-c, --config <filename>', 'use configuration from file')
    .option('-n, --nodes <[host-]tcp|udp:number>', 'comma-separated list of [host-]protocol:port', (v) => v.split(','))
    .option('-s, --server', 'start in server mode, otherwise client mode will be used')
    .option('-e, --easy', 'server will send config to client so client doesn\'t need to provide anything but secret')
    .option('-o, --output <filename>', 'save resulting configuration to file')
    .option('-d, --debug', 'more verbose output')
    .action(main)
    .parse();

async function main(secret: string, options: ProgramOptions) {
    Console.debug(`Starting ${packageData.name} v${packageData.version}`);

    const config = await new ConfigurationBuilder(secret, options).build();
    if (options.output) {
        await writeConfiguration(options.output, config);
    }

    await new NodeFactory(config).run();
}
