import { randomBytes } from 'crypto';


/**
 * Generates a secret from random ```n``` bytes encoded in base64.
 */
export function generateSecret(n = 32): string {
    return randomBytes(n).toString('base64');
}
