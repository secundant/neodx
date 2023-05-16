import { colors } from '@neodx/colors';
import { createLogger } from '@neodx/log';
import { createPrettyTarget } from '@neodx/log/node';

const unnamed = createLogger({
  level: 'debug',
  target: createPrettyTarget()
});
const system = unnamed.fork({
  name: '@neodx/log',
  target: createPrettyTarget({
    displayTime: false
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

/**
 * Introduction
 */

named.info('Starting...');
inmemory.info('Starting in-memory database...');
notifier.info('Connecting to notification service...');
inmemory.warn('Low memory, loading can be failed');
inmemory.error('Out of memory');
named.error('Failed to start');
named.debug('Failure reason: %s', 'Out of memory');
named.info('Shutting down...');
inmemory.info('Unloading database...');
inmemory.verbose("Database wasn't initialized, skipping...");
notifier.info('Clean up connections...');
notifier.verbose('Closed connections: %s', 'no active connections');
named.info('Shutdown complete, exiting...');

console.log('\n\n\n');

/**
 * Levels overview
 */

named.error('Something went wrong!'); // errors most important level
named.warn('Deprecated function used!'); // warnings
named.info('User logged in'); // information, most used level, neutral messages
named.verbose('User opened the page %s', '/home'); // verbose messages, extended information,
named.debug({ login: 'gigachad', password: '123' }, 'User logged in, session id: %s', 'xx-dj2jd'); // debug messages, the least important level, can contain sensitive information for debugging purposes

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
  target: createPrettyTarget({
    badges: null
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
  target: createPrettyTarget({
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
