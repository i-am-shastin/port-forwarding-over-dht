import chalk from 'chalk';
import { program as commander } from 'commander';
import { ZodError } from 'zod';

import { ProgramOptions } from '~types';


export class Console {
    static readonly PROGRAM_OPTIONS: ProgramOptions = commander.opts();

    @normalize
    static message(message: string | ZodError) {
        console.log(chalk.bold(message));
    }

    @normalize
    static info(message: string | ZodError) {
        console.log(chalk.greenBright(message));
    }

    @normalize
    static debug(message: string | ZodError) {
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
    const originalMethod = descriptor.value;
    descriptor.value = function (message: string | ZodError) {
        if (message instanceof ZodError) {
            message = message.errors
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
        }
        return originalMethod.call(this, message);
    };
}
