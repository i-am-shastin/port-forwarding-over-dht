import { Configuration } from '~types';
import { Console } from '~utils/console';
import { getProcessNetworkInfo } from '~utils/process';


export class PromptConfigurationBuilder {
    constructor() {
        Console.debug('Running in prompt mode');
    }

    async run(): Promise<Configuration> {
        const info = await getProcessNetworkInfo();
        Console.debug(info.toString());
        return { nodes: [], secret: '', server: true };
    }
}
