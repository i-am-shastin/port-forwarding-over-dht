import netstat from 'node-netstat';

import { ProtocolType } from '~enums';
import { getProcesses } from '~utils/process';

import type { Gateway } from '~types';


type ProcessLocalNetworkInfo = {
    processId: number;
    protocol: ProtocolType;
    port: number;
    address?: string;
}

function isCorrectProtocol(value: string): value is ProtocolType {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return value === ProtocolType.TCP || value === ProtocolType.UDP;
}

function getNetstatResult() {
    return new Promise<ProcessLocalNetworkInfo[]>((resolve, reject) => {
        const result: ProcessLocalNetworkInfo[] = [];
        netstat(
            {
                done: (e) => e ? reject() : resolve(result)
            },
            (data) => {
                if (!isCorrectProtocol(data.protocol) || data.local.port == null || (data.state && !data.state.startsWith('LISTEN'))) return;

                result.push({
                    processId: data.pid,
                    protocol: data.protocol,
                    port: data.local.port,
                    address: data.local.address ?? undefined
                });
            }
        );
    });
}

/**
 * Gets processes network information.
 * @returns Object where key is ```processName``` and value is array of gateways.
 */
export async function getProcessNetworkInfo() {
    const netstatResult = await getNetstatResult();
    const processes = await getProcesses();

    const mapped = netstatResult
        .reduce<Record<string, Map<string, Gateway>>>((acc, value) => {
            const processName = processes[value.processId];

            if (processName) {
                if (!acc[processName]) {
                    acc[processName] = new Map<string, Gateway>();
                }

                const result: Gateway = {
                    port: value.port,
                    protocol: value.protocol,
                    host: value.address
                };
                acc[processName].set(`${result.port}${result.protocol}${result.host}`, result);
            }

            return acc;
        }, {});

    return Object
        .entries(mapped)
        .reduce<Record<string, Gateway[]>>((acc, [name, gatewayMap]) => {
            acc[name] = Array.from(gatewayMap.values());
            return acc;
        }, {});
}
