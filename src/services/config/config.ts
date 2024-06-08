import { PromptConfigurationBuilder } from '~services/config/prompt';
import { Configuration, ConfigurationSchema, ProgramOptions } from '~types';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { readConfiguration } from '~utils/file';
import { parseNodes } from '~utils/parser';


export class ConfigurationBuilder {
    private get isInteractive(): boolean {
        const optionsCount = Object.keys(this.options).length;
        return Boolean(!this.secret && (optionsCount === 0 || (optionsCount === 1 && this.options.debug)));
    }

    constructor(private secret: string, private options: ProgramOptions) {
        Console.debug(`Initializing configuration builder. Command line is ${process.argv.join(' ')}`);
    }

    /**
     * Builds configuration from command-line arguments and/or user input.
     * @param secret Secret phrase provided as an CLI argument.
     * @param options An array of CLI options.
     */
    async build(): Promise<Configuration> {
        const configuration = await this.getConfiguration();

        const result = ConfigurationSchema.safeParse(configuration);
        if (!result.success) {
            Console.critical(result.error);
            process.exit(-1);
        }

        Console.debug(`Using configuration:\n${JSON.stringify(result.data, null, 4)}`);
        return result.data;
    }

    private async getConfiguration(): Promise<Configuration> {
        if (this.isInteractive) {
            return await new PromptConfigurationBuilder().run();
        }

        Console.debug('Parsing CLI arguments to configuration');
        const configuration = {
            secret: this.secret,
            nodes: this.options.nodes ? parseNodes(this.options.nodes) : [],
            server: this.options.server || false
        };

        if (this.options.config) {
            const jsonConfig = await readConfiguration(this.options.config);
            Console.debug('Merging with CLI configuration');
            configuration.nodes.push(...jsonConfig.nodes);
            configuration.secret = configuration.secret ?? jsonConfig.secret;
        }

        if (this.options.generate) {
            configuration.secret = generateSecret();
            Console.info(`Using randomly generated secret: ${configuration.secret}`);
        }

        return configuration;
    }
}
