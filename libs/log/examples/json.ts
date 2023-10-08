import { createLogger, json } from '@neodx/log/node';

const base = createLogger({
  target: json()
});

base.info('Hello World!');
