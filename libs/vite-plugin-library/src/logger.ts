import * as colors from 'picocolors';

const { bgRed, bold, red, yellow } = colors;
export const logger = {
  fatal(name: string, ...messages: unknown[]) {
    console.error(bgRed(bold(' FATAL ')), red(bold(name)), ...messages);
  },
  warn(name: string, ...messages: unknown[]) {
    console.debug(yellow(bold(` ⚠️ ${name}${messages.length > 0 ? ': ' : ''}`)), ...messages);
  }
};
