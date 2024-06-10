import { PromptConfigurationBuilder } from '~services/config/prompt';
import { Configuration, ConfigurationBuilderResult, ConfigurationSchema, ProgramOptions } from '~types';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { readConfiguration } from '~utils/file';
import { parseNodes } from '~utils/parser';


export class ConfigurationBuilder {
    private get isPromptMode(): boolean {
        const optionsCount = Object.keys(this.options).length;
        return Boolean(!this.secret && (optionsCount === 0 || (optionsCount === 1 && this.options.debug)));
    }

    /**
     * @param secret Secret phrase provided as an CLI argument.
     * @param options An array of CLI options.
     */
    constructor(private secret: string, private options: ProgramOptions) {
        Console.debug(`Initializing configuration builder. Command line is ${process.argv.join(' ')}`);
    }

    /**
     * Builds configuration from command-line arguments or user input.
     */
    async build(): Promise<ConfigurationBuilderResult> {
        const [configuration, output] = await this.getConfiguration();

        const result = ConfigurationSchema.safeParse(configuration);
        if (!result.success) {
            Console.critical(result.error);
            process.exit(-1);
        }

        Console.debug(`Using configuration:\n${JSON.stringify(result.data, null, 4)}`);
        return [result.data, output];
    }

    private async getConfiguration(): Promise<ConfigurationBuilderResult> {
        if (this.isPromptMode) {
            return await new PromptConfigurationBuilder().run();
        }

        Console.debug('Parsing CLI arguments to configuration');
        const configuration: Configuration = {
            secret: this.secret,
            nodes: this.options.nodes ? parseNodes(this.options.nodes) : [],
            server: this.options.server || false,
            easy: this.options.easy || false
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

        return [configuration, this.options.output];
    }
}
