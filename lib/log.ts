import util from 'util';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

export class Logger {
    constructor() { }

    info(...messages: any[]) {
        const [message, ...additionalParams] = messages;
        const logLine = util.format(message, ...additionalParams);
        return isTest ? logLine : console.info(logLine);
    }

    warning(error: string | Error) {
        const errorMessage = error instanceof Error ? (isProduction ? error.message : error.stack) : error;
        const logLine = util.format(errorMessage);
        return isTest ? logLine : console.error(logLine);
    }

    error(error: string | Error, ...additionalParams: any[]) {
        const errorMessage = error instanceof Error ? (isProduction ? error.message : error.stack) : error;
        const logLine = util.format(errorMessage, ...additionalParams);
        return isTest ? logLine : console.error(logLine);
    }

    debug(...messages: any[]) {
        const [message, ...additionalParams] = messages;
        const logLine = util.format(message, ...additionalParams);
        return (isTest || isProduction) ? logLine : console.debug(logLine);
    }
};

export const log = new Logger();