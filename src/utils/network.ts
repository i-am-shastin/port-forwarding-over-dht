import netstat from 'node-netstat';

import { ProtocolType } from '~enums';
import { Gateway } from '~types';
import { getProcesses } from '~utils/process';


export function getNetworkInfo() {
    return new Promise<netstat.ParsedItem[]>((resolve, reject) => {
        const result: netstat.ParsedItem[] = [];
        netstat(
            {
                done: (e) => e ? reject() : resolve(result)
            },
            (data) => {
                result.push(data);
            }
        );
    });
}

export async function getNetworkInfoByProcess() {
    const networkInfo = await getNetworkInfo();
    const processes = await getProcesses();

    return networkInfo.reduce<Record<string, Gateway[]>>((acc, value) => {
        const processName = processes[value.pid];

        if (processName && value.local.address && value.local.port) {
            if (!acc[processName]) acc[processName] = [];

            acc[processName].push({
                port: value.local.port,
                protocol: value.protocol as ProtocolType,
                host: value.local.address
            });
        }

        return acc;
    }, {});
}
