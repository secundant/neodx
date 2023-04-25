import { createLogger } from 'bunyan';

const logger = createLogger({ name: 'myapp' });

logger.info('hello world');
//     logger.info({ foo: 'bar' });
