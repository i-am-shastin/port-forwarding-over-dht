import netstat from 'node-netstat';


export async function getNetworkInfo() {
    return new Promise<netstat.ParsedItem[]>((resolve, reject) => {
        const result: netstat.ParsedItem[] = [];
        netstat({
            done: (e) => {
                if (e) {
                    return reject();
                }
                resolve(result);
            }
        }, (data) => {
            result.push(data);
        });
    });
}
