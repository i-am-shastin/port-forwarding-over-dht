import zod from 'zod';

import { ProtocolType } from '~enums';


export type Gateway = zod.infer<typeof GatewaySchema>;
export const GatewaySchema = zod.object({
    protocol: zod.nativeEnum(ProtocolType),
    port: zod.number().min(0).max(65535),
    host: zod.string().ip({ version: 'v4' }).optional()
});

export type Configuration = zod.infer<typeof ConfigurationSchema>;
export const ConfigurationSchema = zod
    .object({
        secret: zod.string().trim().min(8),
        gateways: GatewaySchema.array(),
        server: zod.boolean().optional(),
        easy: zod.boolean().optional()
    })
    .superRefine(({ server, gateways }, context) => {
        if (server && !gateways.length) {
            context.addIssue({
                path: ['gateways'],
                code: zod.ZodIssueCode.too_small,
                minimum: 1,
                type: 'array',
                inclusive: true
            });
        }
    });

export type ProgramOptions = zod.infer<typeof ProgramOptionsSchema>;
export const ProgramOptionsSchema = zod
    .object({
        config: zod.string(),
        gateways: zod.string().array(),
        server: zod.boolean(),
        easy: zod.boolean(),
        debug: zod.boolean(),
        output: zod.string(),
        random: zod.boolean()
    })
    .partial();

export type ConfigurationBuilderResult = [Configuration, string | undefined];
