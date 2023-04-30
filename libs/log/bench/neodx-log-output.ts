import { createLogger, type DefaultLoggerLevel } from '@neodx/log';
import { createConsoleTarget } from '@neodx/log/browser';
import { createPrettyTarget } from '@neodx/log/node';

const nodeLogger = createLogger<DefaultLoggerLevel>({
  level: 'debug',
  target: createPrettyTarget()
});
const nested = nodeLogger.child('nested');
const child = nested.child('child');
const browser = createLogger<DefaultLoggerLevel>({
  level: 'debug',
  target: createConsoleTarget()
});

nodeLogger.error('System error message');
nodeLogger.warn('Something is wrong!');
nodeLogger.info({ foo: 'bar', my: 'info' }, 'Here is object');
nodeLogger.verbose('Verbose message');
nodeLogger.debug('Debug message');
nodeLogger.error(new SyntaxError("It's error message"));
nodeLogger.error({
  err: new Error('Error with object'),
  foo: 'bar',
  my: 'info'
});

nested.verbose('Verbose message from nested logger');
child.debug('Debug message from child logger');
child.info('Info message from child logger');
child.warn('Warn message from child logger');
child.error('Error message from child logger');
child.verbose('Verbose message from child logger');
const forkedChild = child.fork({
  target: createPrettyTarget({
    badges: null
  })
});

forkedChild.info('Info message without level symbol');
forkedChild.warn('Warning without level symbol');
forkedChild.error('Error without level symbol');

const timeless = nodeLogger.fork({
  target: createPrettyTarget({
    displayTime: false
  })
});

timeless.info('Info message without time');
timeless.warn('Warning without time');
timeless.error('Error without time');

const timelessChild = child.fork({
  target: createPrettyTarget({
    displayTime: false
  })
});

timelessChild.info('Info message without time from child logger');
timelessChild.warn('Warning without time from child logger');
timelessChild.error('Error without time from child logger');

browser.error('System error message');
browser.warn('Something is wrong!');
browser.info({ foo: 'bar', my: 'info' }, 'Here is object');
browser.verbose('Verbose message');
browser.debug('Debug message');
browser.error(new SyntaxError("It's error message"));
browser.info('Message with %s', 'format');
browser.error({
  err: new Error('Error with object'),
  foo: 'bar',
  my: 'info'
});
