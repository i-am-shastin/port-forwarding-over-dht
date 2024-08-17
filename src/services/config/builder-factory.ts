import { ConfigurationBuilder } from '~services/config/builder';
import { PromptConfigurationBuilder } from '~services/config/prompt';
import type { IConfigurationBuilder } from '~src/interfaces';
import type { ProgramOptions } from '~types';
import { Console } from '~utils/console';


export abstract class ConfigurationBuilderFactory {
    static createBuilder(secret: string, options: ProgramOptions): IConfigurationBuilder {
        Console.debug(`Command line is ${process.argv.join(' ')}`);

        const optionsCount = Object.keys(options).length;
        const isPromptMode = !secret && Boolean(!optionsCount || (optionsCount === 1 && options.debug));

        if (isPromptMode) {
            return new PromptConfigurationBuilder();
        }
        return new ConfigurationBuilder(secret, options);
    }
}
