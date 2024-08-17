import chalk from 'chalk';
import { program } from 'commander';
import { ZodError } from 'zod';

import { ProgramOptions } from '~types';


export abstract class Console {
    static readonly PROGRAM_OPTIONS: ProgramOptions = program.opts();

    static message(message: string) {
        console.log(chalk.bold(message));
    }

    static info(message: string) {
        console.log(chalk.greenBright(message));
    }

    static debug(message: string) {
        this.PROGRAM_OPTIONS.debug && console.log(chalk.italic.gray(`~ ${message}`));
    }

    @normalize
    static error(message: string | ZodError) {
        console.log(chalk.red(message));
    }

    @normalize
    static critical(message: string | ZodError) {
        console.log(chalk.bold.redBright(message));
    }
}

function normalize(_target: object, _key: PropertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (message: string | ZodError) => void;
    descriptor.value = function (message: string | ZodError) {
        if (message instanceof ZodError) {
            message = message.errors
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
        }
        return originalMethod.call(this, message);
    };
}
