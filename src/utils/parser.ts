import { ZodError } from 'zod';

import { Gateway, GatewaySchema } from '~types';
import { Console } from '~utils/console';


/**
 * Regular expression that matches ```[host-]protocol:port```.
 * @param host IP address (optional).
 * @param protocol TCP or UDP (string, case insensitive).
 * @param port 1-5 digits.
 *
 * @see https://regexr.com/855od
 */
const regex = /^\s*(?:((?:\d{1,3}\.){3}\d{1,3})-)?(tcp|udp):(\d{1,5})\s*$/i;

function parseGateway(input: string): Gateway | ZodError {
    const result = regex.exec(input);
    if (!result) {
        return new ZodError([{
            code: 'custom',
            message: `Input string is in non-valid format, received "${input}"`,
            path: []
        }]);
    }

    const parseResult = GatewaySchema.safeParse({
        host: result.at(1),
        protocol: result.at(2)!.toLowerCase(),
        port: Number(result.at(3))
    });

    return parseResult.success ? parseResult.data : parseResult.error;
}

export function parseGateways(gateways: string): Gateway[];
export function parseGateways(gateways: string[]): Gateway[];
export function parseGateways(gateways: string | string[]): Gateway[] {
    Console.debug(`Parsing gateways from CLI arguments: ${gateways.toString()}`);

    if (typeof gateways === 'string') {
        gateways = gateways.split(',');
    }

    return gateways.reduce<Gateway[]>((acc, gateway, index) => {
        const path = `gateways[${index}]`;
        const result = parseGateway(gateway);

        if (result instanceof ZodError) {
            result.issues.forEach((i) => i.path.unshift(path));
            Console.error(result);
        } else {
            acc.push(result);
            Console.debug(`${path}: ${JSON.stringify(result)}`);
        }

        return acc;
    }, []);
}

export function testGateways(input: string): boolean {
    return input
        .split(',')
        .every((gateway) => regex.exec(gateway) != null);
}
