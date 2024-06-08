import { ZodError } from 'zod';

import { Node, NodeSchema } from '~types';
import { Console } from '~utils/console';


/**
 * Regular expression that matches [host-]protocol:port
 * @param host IP address (optional)
 * @param protocol TCP/UDP (case insensitive)
 * @param port number (0-65535)
 */
const regex = new RegExp('(?:((?:\\d{1,3}\\.){3}\\d{1,3})-)?(tcp|udp):(\\d+)', 'i');

function parseNode(input: string): Node | Zod.ZodError {
    const result = regex.exec(input);
    if (!result) {
        return new ZodError([
            {
                code: 'custom',
                message: `Input string is in non-valid format, received "${input}"`,
                path: []
            }
        ]);
    }

    const port = NodeSchema.safeParse({
        port: Number(result.at(3)),
        protocol: result.at(2)?.toLowerCase(),
        host: result.at(1)
    });

    return port.success ? port.data : port.error;
}

export function parseNodes(nodes: string[]): Node[] {
    Console.debug(`Parsing nodes from CLI arguments: ${nodes.join(', ')}`);
    return nodes.reduce<Node[]>((acc, node, index) => {
        const path = `nodes[${index}]`;
        const result = parseNode(node);

        if (result instanceof ZodError) {
            result.issues.forEach((i) => i.path.unshift(path));
            Console.error(result);
        } else {
            acc.push(result);
            Console.debug(`${path}: ${JSON.stringify(result, null, ' ').replace(/\s+/g, ' ')}`);
        }

        return acc;
    }, []);
}
