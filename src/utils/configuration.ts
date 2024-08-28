import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

import { Configuration, ConfigurationSchema } from '~types';
import { Console } from '~utils/console';
import { pick } from '~utils/object';


export async function read(filename: string) {
    Console.message(`Reading configuration from ${resolve(filename)}`);
    const file = await readFile(filename, 'utf8');
    const output = JSON.parse(file) as Configuration;
    return trimConfigurationObject(output);
}

export async function write(configuration: Configuration, filename: string) {
    const jsonConfig = trimConfigurationObject(configuration);
    const output = stringify(jsonConfig);
    await writeFile(filename, output, 'utf8');
    Console.message(`Configuration saved to ${resolve(filename)}`);
}

export function validate(configuration: Configuration) {
    return ConfigurationSchema.safeParse(configuration);
}

export function stringify(configuration: Partial<Configuration>): string {
    return JSON.stringify(configuration, null, 4);
}

function trimConfigurationObject(object: Configuration) {
    return pick(object, 'gateways', 'secret', 'easy');
}
