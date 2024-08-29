import { read } from '~utils/configuration';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { parseGateways } from '~utils/gateway';

import type { IConfigurationBuilder } from '~src/interfaces';
import type { Configuration, ConfigurationBuilderResult, ProgramOptions } from '~types';


export class ConfigurationBuilder implements IConfigurationBuilder {
    /**
     * Builds configuration from command-line arguments.
     * @param secret Secret phrase provided as an CLI argument.
     * @param options CLI options.
     */
    constructor(private secret: string, private options: ProgramOptions) {
        Console.debug('Initializing configuration builder');
    }

    /** @inheritdoc */
    async build(): Promise<ConfigurationBuilderResult> {
        Console.debug('Parsing CLI arguments to configuration');
        const configuration: Configuration = {
            secret: this.secret,
            gateways: this.options.gateways ? parseGateways(this.options.gateways) : [],
            server: this.options.server ?? false,
            easy: this.options.easy ?? false
        };

        if (this.options.config) {
            Console.debug(`Merging file ${this.options.config} with CLI configuration`);
            const jsonConfig = await read(this.options.config);
            configuration.gateways.push(...jsonConfig.gateways);
            configuration.secret = configuration.secret ?? jsonConfig.secret;
        }

        if (this.options.random) {
            configuration.secret = generateSecret();
            Console.info(`Using randomly generated secret: ${configuration.secret}`);
        }

        return [configuration, this.options.output];
    }
}
