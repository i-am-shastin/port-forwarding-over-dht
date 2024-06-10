import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

import { Configuration } from '~types';
import { Console } from '~utils/console';
import { pick } from '~utils/types';


export async function readConfiguration(filename: string) {
    Console.message(`Reading configuration from ${resolve(filename)}`);
    const file = await readFile(filename, 'utf8');
    return trimConfigurationObject(JSON.parse(file) as Configuration);
}

export async function writeConfiguration(filename: string, configuration: Configuration) {
    const jsonConfig = trimConfigurationObject(configuration);
    const output = JSON.stringify(jsonConfig, null, 4);
    await writeFile(filename, output, 'utf8');
    Console.message(`Configuration saved to ${resolve(filename)}`);
}

function trimConfigurationObject(obj: Configuration) {
    return pick(obj, 'nodes', 'secret', 'easy');
}
