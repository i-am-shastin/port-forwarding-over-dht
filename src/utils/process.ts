import { parse } from 'path';

import { ProtocolType } from '~src/enums';
import { Process } from '~src/types';
import { getNetworkInfo } from '~utils/network';


async function getProcessList() {
    const { default: psList } = await import('ps-list');
    return await psList();
}

export async function getProcessNetworkInfo() {
    const networkInfo = await getNetworkInfo();
    const processList = await getProcessList();

    return networkInfo.reduce<Record<number, Process>>((acc, value) => {
        if (!acc[value.pid]) {
            const process = processList.find((p) => p.pid === value.pid);

            if (process) {
                acc[value.pid] = {
                    name: process.cmd ? parse(process.cmd).base : process.name,
                    nodes: []
                };
            }
        }

        if (value.local.address && value.local.port) {
            acc[value.pid].nodes.push({
                port: value.local.port,
                protocol: value.protocol as ProtocolType,
                host: value.local.address
            });
        }

        return acc;
    }, {});
}
