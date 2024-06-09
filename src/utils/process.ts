import { parse } from 'path';

import { ProtocolType } from '~src/enums';
import { Node } from '~types';
import { getNetworkInfo } from '~utils/network';


async function getProcesses() {
    const { default: psList } = await import('ps-list');
    const processList = await psList();
    return processList.reduce<Record<number, string>>((acc, process) => {
        acc[process.pid] = process.cmd ? parse(process.cmd).base : process.name;
        return acc;
    }, {});
}

export async function getProcessNetworkInfo() {
    const networkInfo = await getNetworkInfo();
    const processes = await getProcesses();

    return networkInfo.reduce<Record<string, Node[]>>((acc, value) => {
        const processName = processes[value.pid];

        if (processName) {
            if (!acc[processName]) {
                acc[processName] = [];
            }

            if (value.local.address && value.local.port) {
                acc[processName].push({
                    port: value.local.port,
                    protocol: value.protocol as ProtocolType,
                    host: value.local.address
                });
            }
        }

        return acc;
    }, {});
}
