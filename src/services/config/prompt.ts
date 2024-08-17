import { Separator, confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

import { Mode } from '~enums';
import type { IConfigurationBuilder } from '~src/interfaces';
import { ConfigurationBuilderResult, Gateway } from '~types';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { getNetworkInfoByProcess } from '~utils/network';
import { parseGateways } from '~utils/parser';


/**
 * Builds configuration from user input.
 */
export class PromptConfigurationBuilder implements IConfigurationBuilder {
    constructor() {
        Console.debug('Initializing prompt configuration builder');
    }

    async build(): Promise<ConfigurationBuilderResult> {
        Console.debug('Requesting mode');
        const appMode = await select({
            message: 'Choose program mode:',
            choices: Object.values(Mode).map((v) => ({ value: v })),
        });

        Console.debug('Requesting gateways');
        const gateways = await this.promptGateways(appMode);

        Console.debug('Requesting secret');
        const secret = await input({
            message: 'Enter secret:',
            default: appMode === Mode.Server ? generateSecret() : undefined,
            validate: (value) => {
                if (appMode === Mode.Server || value.trim().length >= 8) {
                    return true;
                }
                return 'Secret must contain at least 8 characters';
            },
        });

        const easy = appMode === Mode.Server ? await this.promptEasyMode() : false;
        const output = gateways?.length ? await this.promptOutputFile() : undefined;

        return [
            {
                gateways,
                secret,
                easy,
                server: appMode === Mode.Server
            },
            output
        ];
    }

    private async promptGateways(programMode: Mode): Promise<Gateway[]> {
        const isManual = await confirm({
            default: false,
            message: 'Do you know what protocols/ports to use?'
        });

        if (isManual) {
            Console.debug('Requesting manual input of gateways');
            const ports = await input({ message: 'Enter gateways (comma-separated list of [host-]protocol:port):' });
            return parseGateways(ports);
        }

        if (programMode === Mode.Client) {
            Console.info('In this case, server must be running in easy mode');
            return [];
        }

        Console.debug('Obtaining process list');
        const processInfo = await getNetworkInfoByProcess();
        const processNames = Object.keys(processInfo)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((v) => ({ value: v }));

        Console.debug('Using process list to get gateways');
        const process = await select({
            message: 'Select process:',
            choices: [...processNames, new Separator()],
            theme: {
                style: {
                    highlight: (input: string) => {
                        const process = input.substring(2);
                        const gateways = this.stringify(processInfo[process]);
                        return `${chalk.cyan(input)} ${chalk.gray(`(${gateways})`)}`;
                    }
                }
            }
        });

        return processInfo[process];
    }

    private promptEasyMode(): Promise<boolean> {
        Console.debug('Requesting easy mode');
        return confirm({ message: 'Start server in easy mode? (gateways configuration will be automatically sent to client)' });
    }

    private async promptOutputFile(): Promise<string | undefined> {
        Console.debug('Requesting configuration output filename');
        if (await confirm({ message: 'Do you want to save configuration?' })) {
            return input({ message: 'Enter filename:' });
        }
    }

    private stringify(gateways: Gateway[]): string {
        const protocols = gateways.reduce((acc, v) => (acc[v.protocol].push(v.port), acc), { tcp: [] as number[], udp: [] as number[] });
        return Object.entries(protocols)
            .filter(([, values]) => values.length)
            .map(([key, values]) => `${chalk.white(key.toUpperCase())}: ${values.join(', ')}`)
            .join(', ');
    }
}
