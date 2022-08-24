import chalk from 'chalk';

export const logger = {
  fatal(name: string, ...messages: unknown[]) {
    console.error(chalk.bgRed(chalk.bold(' FATAL ')), chalk.red(chalk.bold(name)), ...messages);
  },
  info(name: string, ...messages: unknown[]) {
    console.info(
      chalk.blue('info'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  },
  warn(name: string, ...messages: unknown[]) {
    console.debug(
      chalk.yellow('warn'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  }
};
