import { pino } from 'pino';

const logger = pino({});

logger.info('hello world');
//     logger.info({ foo: 'bar' });
