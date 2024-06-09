import { z as zod } from 'zod';

import { ProgramMode, ProtocolType } from '~enums';


export type Node = zod.infer<typeof NodeSchema>;
export const NodeSchema = zod.object({
    protocol: zod.nativeEnum(ProtocolType),
    port: zod.number().min(0).max(65535),
    host: zod.string().ip({ version: 'v4' }).optional()
});

export type Configuration = zod.infer<typeof ConfigurationSchema>;
export const ConfigurationSchema = zod
    .object({
        secret: zod.string().trim().min(8),
        nodes: NodeSchema.array(),
        server: zod.boolean(),
        easy: zod.boolean()
    })
    .superRefine(({ server, nodes }, context) => {
        if (server && !nodes.length) {
            context.addIssue({
                path: ['nodes'],
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
        nodes: zod.string().array(),
        server: zod.boolean(),
        easy: zod.boolean(),
        debug: zod.boolean(),
        output: zod.string(),
        generate: zod.boolean()
    })
    .partial();

export type Answers = {
    mode: ProgramMode;
    secret: string;
    knownNodes: boolean;
    nodes?: string[];
    process?: string;
    save: boolean;
    easy?: boolean;
};
