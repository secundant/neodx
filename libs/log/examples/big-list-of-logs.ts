import { colors } from '@neodx/colors';
import { createLogger, DEFAULT_LOGGER_LEVELS, pretty } from '@neodx/log/node';

const unnamed = createLogger({
  level: 'debug',
  target: pretty()
});
const system = unnamed.fork({
  name: '@neodx/log',
  target: pretty({
    displayTime: false,
    prettyErrors: true
  }),
  transform: chunk => ({
    ...chunk,
    msg: colors.white(chunk.msg)
  })
});
const named = unnamed.fork({
  name: 'myapp'
});
const child = named.child('child');
const inmemory = named.child('inmemory');
const notifier = named.child('notifier');

const isEnoughMemory = () => false;

function assertMemory() {
  if (!isEnoughMemory()) {
    throw new Error('Out of memory');
  }
}

function runSafeInMemoryDatabase() {
  try {
    assertMemory();
  } catch (error) {
    inmemory.error(error);
  }
}

/**
 * Introduction
 */

named.info('Starting...');
inmemory.info('Starting in-memory database...');
notifier.info('Connecting to notification service...');
inmemory.warn('Low memory, loading can be failed');
runSafeInMemoryDatabase();
named.error('Failed to start');
named.debug('Failure reason: %s', 'Out of memory');
named.info('Shutting down...');
inmemory.info('Unloading database...');
inmemory.verbose("Database wasn't initialized, skipping...");
notifier.info('Clean up connections...');
notifier.success('Closed connections: %s', 'no active connections');
named.done('Shutdown complete, exiting...');

console.log('\n\n\n');

/**
 * Levels overview
 */

named.error('Something went wrong!'); // errors most important level
named.warn('Deprecated function used!'); // warnings
named.info('User logged in'); // information, most used level, neutral messages
named.done('Task completed'); // any success messages, by default less important than "info"
named.success('Session has been closed'); // alias to "done"
named.debug({ login: 'gigachad', password: '123' }, 'User logged in, session id: %s', 'xx-dj2jd'); // debug messages, the least important level, can contain sensitive information for debugging purposes
named.verbose('User opened the page %s', '/home'); // verbose messages, extended information, alias to "debug"

console.log('\n\n\n');
/**
 * Full example
 */

system.info('Unnamed logger in debug mode');
system.info(`${colors.underline('const unnamed = createLogger({ level: "debug" })')}`);
console.log('');

unnamed.info("Dinner is ready and you don't see my name");
unnamed.warn('You have 5 minutes to finish your meal');
unnamed.error('You have 1 minute to finish your meal');

console.log('');
system.info('Named logger in debug mode');
system.info(
  `${colors.underline('const named = createLogger({ name: "myapp", level: "debug" })')} `
);
console.log('');

named.info('Request received');
named.warn('Possible corruption detected');
named.error('Validation failed - wrong email');
named.verbose('Invalid params: "%s". Reasons: "%s"', 'email', 'fishing attack');
named.debug(
  {
    message: "I'm your support assistant, please send me your email and password",
    email: 'support@googel.com'
  },
  'Dangerous data'
);

console.log('');
system.info('Child logger');
system.info(`${colors.underline('const child = named.child("child")')}`);
console.log('');

child.info('All messages');
child.warn('will automatically');
child.error('have name prefix');
child.verbose('and will be synchronized');
const forked = child.fork({
  target: pretty({
    levelBadges: null
  })
});

console.log('');
system.info('Fork child logger (.fork() returns modified copy of logger)');
system.info(`${colors.underline('const forked = child.fork({...})')}`);
console.log('');

forked.info('Info message without level symbol');
forked.warn('Warning without level symbol');
forked.error('Error without level symbol');

const timelessChild = child.fork({
  target: pretty({
    displayTime: false
  })
});

console.log('');
system.info('Fork child logger with disabled time display');
console.log('');

timelessChild.info('Info message without time from child logger');
timelessChild.warn('Warning without time from child logger');
timelessChild.error('Error without time from child logger');

console.log('');
system.info('Error output');
console.log('');

unnamed.error('Error as string message');
unnamed.error(new SyntaxError("Message in SyntaxError's constructor"));
unnamed.error(
  {
    err: new Error('Error message'),
    foo: 'bar',
    my: 'info'
  },
  'Error in object with additional info'
);

const aliases = createLogger({
  name: 'aliases',
  level: 'trace',
  levels: {
    ...DEFAULT_LOGGER_LEVELS,
    fatal: 'error',
    trace: 'debug'
  },
  target: pretty({
    levelColors: {
      ...pretty.defaultColors,
      fatal: 'red',
      trace: 'magentaBright'
    },
    levelBadges: {
      ...pretty.defaultBadges,
      fatal: '💀',
      trace: '❯'
    }
  })
});

console.log('\n\n');

aliases.error('Message from error level');
aliases.fatal('fatal is alias for error');
aliases.warn('Attention!');
aliases.info('Some common information');
aliases.done('Success message');
aliases.debug('Additional details');
aliases.verbose('is alias for debug');
aliases.trace('is alias for debug, too!');

console.log('\n\n');
