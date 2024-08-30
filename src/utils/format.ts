import chalk from 'chalk';

import { ProtocolType } from '~enums';

import type { Gateway } from '~types';


/**
 * Converts array of gateways to human-readable string.
 */
export function gatewaysToString(gateways: Gateway[]): string {
    const result = {
        [ProtocolType.TCP]: new Set<number>(),
        [ProtocolType.UDP]: new Set<number>()
    };

    for (const element of gateways) {
        result[element.protocol].add(element.port);
    }

    return Object.entries(result)
        .filter(([, values]) => values.size)
        .map(([type, ports]) => `${chalk.white(type)}: ${portsToIntervals(ports)}`)
        .join(', ');
}

function portsToIntervals(ports: Set<number>) {
    return [...ports.values()]
        .sort((a, b) => a - b)
        .reduce<[min: number, max: number][]>((acc, current) => {
            const previous = acc.length - 1;
            if (previous === -1 || (current - acc[previous][1] !== 1)) {
                acc.push([current, current]);
            } else {
                acc[previous][1] = current;
            }
            return acc;
        }, [])
        .map(([min, max]) => {
            return min !== max ? `${min}-${max}` : min;
        })
        .join(', ');
}
