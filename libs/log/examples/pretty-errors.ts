import { createLogger, pretty } from '@neodx/log/node';
import { CustomError, errorWithCause } from '../bench/shared';
import { createAppLikeExample } from './pretty-errors-files/app';

const simpleError = new Error('simple error message example');
const errorWithCustomType = new SyntaxError('syntax error');
const errorWithLongMessage = new Error(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. ' +
    'Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. ' +
    'Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ' +
    'ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. '
);

const badFunction = () => {
  throw new Error('uncaught error!');
};
const apiName = () => badFunction();
const serviceName = () => apiName();
const controllerName = () => serviceName();

function runPrettyErrorsExample(enablePrettyErrors = true) {
  const log = createLogger({
    name: 'example',
    target: pretty({
      prettyErrors: enablePrettyErrors
    })
  });
  const app = createAppLikeExample();

  function simpleStackTraceExample() {
    try {
      controllerName();
    } catch (error) {
      log.error(error);
    }
  }

  log.error(simpleError);
  log.error(errorWithCustomType);
  log.error(errorWithLongMessage);
  log.error(errorWithCustomType, 'Additional message');
  log.error(new CustomError('custom error message example'));
  log.error(errorWithCause);
  simpleStackTraceExample();
  try {
    app.call();
  } catch (error) {
    log.error(error);
  }
}

console.log('\n========== prettyErrors: false ===========\n');
runPrettyErrorsExample(false);
console.log('\n========== prettyErrors: true (default) ===========\n');
runPrettyErrorsExample();
console.log('\n');
