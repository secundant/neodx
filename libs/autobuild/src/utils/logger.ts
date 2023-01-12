import colors from 'picocolors';

const { bgRed, blue, bold, red, yellow } = colors;

export const logger = {
  fatal(name: string, ...messages: unknown[]) {
    console.error(bgRed(bold(' FATAL ')), red(bold(name)), ...messages);
  },
  info(name: string, ...messages: unknown[]) {
    console.info(blue('info'), bold(`${name}${messages.length > 0 ? ': ' : ''}`), ...messages);
  },
  warn(name: string, ...messages: unknown[]) {
    console.debug(yellow('warn'), bold(`${name}${messages.length > 0 ? ': ' : ''}`), ...messages);
  }
};
