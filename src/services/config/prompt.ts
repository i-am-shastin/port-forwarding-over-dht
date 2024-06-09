import { ProgramMode } from '~enums';
import { Answers, Configuration, Node } from '~types';
import { Console } from '~utils/console';
import { generateSecret } from '~utils/crypto';
import { parseNodes } from '~utils/parser';
import { getProcessNetworkInfo } from '~utils/process';


export class PromptConfigurationBuilder {
    constructor() {
        Console.debug('Running interactive configuration builder');
    }

    async run(): Promise<Configuration> {
        const { default: inquirer } = await import('inquirer');
        const processInfo = await getProcessNetworkInfo();
        const processNames = Object.keys(processInfo).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        const result = await inquirer.prompt<Answers>([
            {
                name: 'mode',
                type: 'list',
                message: 'Choose program mode:',
                choices: [ProgramMode.Client, ProgramMode.Server]
            },
            {
                name: 'knownNodes',
                type: 'confirm',
                default: false,
                message: 'Do you know what ports to use?'
            },
            {
                name: 'nodes',
                message: 'Enter nodes (comma-separated list of [host-]protocol:port):',
                when: (answers: Answers) => answers.knownNodes,
                filter: (input: string) => input.split(',')
            },
            {
                name: 'process',
                type: 'list',
                message: 'Select process:',
                choices: [...processNames, new inquirer.Separator()],
                when: (answers: Answers) => answers.mode === ProgramMode.Server && !answers.knownNodes,
            },
            {
                name: 'secret',
                message: 'Enter secret:',
                default: (answers: Answers) => {
                    if (answers.mode === ProgramMode.Server) {
                        return generateSecret();
                    }
                },
                validate: (input: string, answers: Answers) => {
                    if (answers.mode === ProgramMode.Server || input.trim().length >= 8) {
                        return true;
                    }
                    return 'Secret must contain at least 8 characters';
                }
            },
            {
                name: 'save',
                type: 'confirm',
                message: 'Do you want to save configuration?',
                when: (answers: Answers) => {
                    return answers.nodes && answers.nodes.length > 0;
                }
            }
        ]);

        let nodes: Node[] = [];
        if (result.nodes) {
            nodes = parseNodes(result.nodes);
        }
        if (result.process) {
            nodes = processInfo[result.process];
        }

        return {
            nodes,
            secret: result.secret,
            server: result.mode === ProgramMode.Server,
            easy: result.mode === ProgramMode.Server && result.easy === true
        };
    }
}
