/* eslint-disable jsdoc/require-jsdoc */
import chalk from 'chalk';
import { program } from 'commander';
import { stdout } from 'node:process';
import { ZodError } from 'zod';

import type { ProgramOptions } from '~types';


const spinnerFrames = ['⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽', '⣾'];
const commands = {
    cursorVisible: '\x1B[?25h',
    cursorHidden: '\x1B[?25l',
    clearToEnd: '\x1B[0K'
};

export abstract class Console {
    private static readonly PROGRAM_OPTIONS: ProgramOptions = program.opts();

    /**
     * Starts spinner animation.
     * @param message Optional message to display aside of spinner.
     * @returns Function to stop spinner animation.
     * @see https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
     */
    static spinner(message = '') {
        stdout.write(commands.cursorHidden);

        let i = 0;
        const timer = setInterval(() => {
            stdout.write(`\r${chalk.green(spinnerFrames[i])} ${message}\r`);
            i = ++i % spinnerFrames.length;
        }, 80);

        return () => {
            clearInterval(timer);
            stdout.write(commands.cursorVisible);
        };
    }

    @clearLine
    static message(message: string) {
        console.log(chalk.bold(message));
    }

    @clearLine
    static info(message: string) {
        console.log(chalk.greenBright(message));
    }

    @clearLine
    static debug(message: string) {
        this.PROGRAM_OPTIONS.debug && console.log(chalk.italic.gray(`~ ${message}`));
    }

    @normalize
    @clearLine
    static error(message: string | ZodError) {
        console.error(chalk.red(message));
    }

    @normalize
    @clearLine
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

function clearLine(_target: object, _key: PropertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (message: string) => void;
    descriptor.value = function (message: string) {
        return originalMethod.call(this, `${commands.clearToEnd}${message}`);
    };
}
