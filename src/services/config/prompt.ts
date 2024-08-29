import { Separator, confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

import { Mode } from '~enums';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { gatewaysToString } from '~utils/format';
import { parseGateways, testGateways } from '~utils/gateway';
import { getProcessNetworkInfo } from '~utils/network';

import type { IConfigurationBuilder } from '~src/interfaces';
import type { Configuration, ConfigurationBuilderResult, Gateway } from '~types';


export class PromptConfigurationBuilder implements IConfigurationBuilder {
    /**
     * Builds configuration from user input.
     */
    constructor() {
        Console.debug('Initializing prompt configuration builder');
    }

    /** @inheritdoc */
    async build(): Promise<ConfigurationBuilderResult> {
        try {
            return await this.interactiveBuild();
        } catch (e) {
            const isError = e instanceof Error;
            if (!isError || e.name !== 'ExitPromptError') {
                Console.critical(String(isError ? e.message : e));
            }
            process.exit(-2);
        }
    }

    private async interactiveBuild(): Promise<ConfigurationBuilderResult> {
        Console.debug('Requesting mode');
        const appMode = await select({
            message: 'Choose program mode:',
            choices: Object.values(Mode).map((v) => ({ value: v })),
        });
        const server = appMode === Mode.Server;

        Console.debug('Requesting gateways');
        const gateways = await this.promptGateways(!server);

        Console.debug('Requesting secret');
        const secret = await input({
            message: 'Enter secret:',
            default: server ? generateSecret() : undefined,
            validate: (value) => {
                if (value.trim().length >= 8) {
                    return true;
                }
                return 'Secret must contain at least 8 characters';
            },
        });

        const easy = server ? await this.promptEasyMode() : gateways.length == 0;
        const output = gateways.length ? await this.promptOutputFile() : undefined;
        const configuration: Configuration = {
            gateways,
            secret,
            easy,
            server
        };

        return [configuration, output];
    }

    private async promptGateways(isClient: boolean): Promise<Gateway[]> {
        const isManual = await confirm({
            default: false,
            message: 'Do you know what protocols/ports to use?'
        });

        if (isManual) {
            Console.debug('Requesting manual input of gateways');
            const gateways = await input({
                message: `Enter gateways ${chalk.gray('(comma-separated list of [host-]protocol:port)')}:`,
                validate: (value) => testGateways(value),
            });
            return parseGateways(gateways);
        }

        if (isClient) {
            Console.info('In this case, server must be running in easy mode');
            return [];
        }

        Console.debug('Obtaining process list');
        const processes = await getProcessNetworkInfo();
        const processNames = Object.keys(processes)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((v) => ({ value: v }));

        Console.debug('Using process list to get gateways');
        const processName = await select({
            message: 'Select process:',
            choices: [...processNames, new Separator()],
            theme: {
                style: {
                    highlight: (input: string) => {
                        const process = input.substring(2);
                        const gateways = gatewaysToString(processes[process]);
                        return `${chalk.cyan(input)} ${chalk.gray(`(${gateways})`)}`;
                    }
                }
            }
        });

        return processes[processName];
    }

    private promptEasyMode(): Promise<boolean> {
        Console.debug('Requesting easy mode');
        return confirm({ message: 'Start server in easy mode? (gateways configuration will be automatically sent to client)' });
    }

    private async promptOutputFile(): Promise<string | undefined> {
        Console.debug('Requesting configuration output filename');
        if (await confirm({ message: 'Do you want to save configuration?' })) {
            return input({
                message: 'Enter filename:',
                default: './config.json'
            });
        }
    }
}
