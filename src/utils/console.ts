import chalk from 'chalk';
import { program } from 'commander';
import { stdout } from 'node:process';
import { ZodError } from 'zod';

import { ProgramOptions } from '~types';


export abstract class Console {
    private static readonly PROGRAM_OPTIONS: ProgramOptions = program.opts();

    private static readonly spinnerFrames = ['⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽', '⣾'];
    private static readonly cursorState = {
        visible: '\r\x1B[?25h',
        hidden: '\x1B[?25l'
    };

    /**
     * Starts spinner animation.
     * @param message Optional message to display aside of spinner.
     * @returns Function to stop spinner animation.
     * @see https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
     */
    static spinner(message = '') {
        stdout.write(this.cursorState.hidden);

        let i = 0;
        const timer = setInterval(() => {
            stdout.write(`\r${chalk.green(this.spinnerFrames[i])} ${message}`);
            i = ++i % this.spinnerFrames.length;
        }, 80);

        return () => {
            clearInterval(timer);
            stdout.write(this.cursorState.visible);
        };
    }

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
        console.error(chalk.red(message));
    }

    @normalize
    static critical(message: string | ZodError) {
        console.error(chalk.bold.redBright(message));
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
