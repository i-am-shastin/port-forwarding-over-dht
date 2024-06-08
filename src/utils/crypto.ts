import { randomBytes } from 'crypto';


export function generateSecret(length = 32): string {
    return randomBytes(length).toString('base64');
}
