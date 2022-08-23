import chalk from 'chalk';

export const logger = {
  fatal(name: string, ...messages: unknown[]): never {
    console.error(chalk.bgRed(chalk.bold(' FATAL ')), chalk.red(chalk.bold(name)), ...messages);
    process.exit(1);
  },
  info(name: string, ...messages: unknown[]) {
    console.info(
      chalk.blue('info'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  },
  warn(name: string, ...messages: unknown[]) {
    console.warn(
      chalk.blue('warn'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  }
};
