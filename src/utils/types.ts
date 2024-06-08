export function pick<T extends object, K extends keyof T>(object: T, ...keys: K[]) {
    return keys.reduce((acc, key) => (acc[key] = object[key], acc), {} as { [P in K]: T[P] });
}
