import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { ConfigurationSchema } from '~types';
import { Console } from '~utils/console';

import type { Configuration } from '~types';


/**
 * Reads configuration from file.
 */
export async function read(filename: string) {
    Console.message(`Reading configuration from ${resolve(filename)}`);
    const file = await readFile(filename, 'utf8');
    return JSON.parse(file) as Configuration;
}

/**
 * Writes configuration to file.
 */
export async function write(configuration: Configuration, filename: string) {
    const output = JSON.stringify(configuration, null, 4);
    await writeFile(filename, output, 'utf8');
    Console.message(`Configuration saved to ${resolve(filename)}`);
}

/**
 * Validates provided configuration-like object.
 */
export function validate(configuration: Configuration) {
    return ConfigurationSchema.safeParse(configuration);
}
