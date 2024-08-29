import { parse } from 'path';
import psList from 'ps-list';


/**
 * Gets running processes.
 * @returns Object where key is ```processId``` and value is ```processName```.
 */
export async function getProcesses() {
    const processList = await psList();
    return processList.reduce<Record<number, string>>((acc, process) => {
        acc[process.pid] = process.cmd ? parse(process.cmd).base : process.name;
        return acc;
    }, {});
}
