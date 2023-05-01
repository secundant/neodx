import { createLogger } from '@neodx/log';
import { createJsonTarget, createPrettyTarget, NODE_LOGGER_SYSTEM_INFO } from '@neodx/log/node';
import * as bunyan from 'bunyan';
import loglevel from 'loglevel';
import { createWriteStream } from 'node:fs';
import pino from 'pino';
import * as winston from 'winston';
import deep from '../package.json' assert { type: 'json' };

const voidFn = () => {};

export const neodxLoggerTargets = {
  dummy: {
    pretty: createPrettyTarget({
      log: voidFn,
      logError: voidFn
    }),
    json: createJsonTarget({
      target: voidFn
    })
  }
};

export const devNullStream = createWriteStream('/dev/null');

export const createExampleCircularJson = () => {
  const jsonObject = { num: 1, obj: { nil: null }, arr: ['str'] };

  (jsonObject as any).loop = jsonObject.obj;
  (jsonObject as any).arr[1] = jsonObject;

  return jsonObject;
};

(deep as any).deep = Object.assign({}, JSON.parse(JSON.stringify(deep)));
(deep as any).deep.deep = Object.assign({}, JSON.parse(JSON.stringify(deep)));
(deep as any).deep.deep.deep = Object.assign({}, JSON.parse(JSON.stringify(deep)));

export const exampleObjects = {
  simpleError: new Error('simple error'),
  circular: createExampleCircularJson(),
  simple: { num: 1, hello: 'world' },
  simpleErrorWithMeta: { err: new Error('hello'), num: 10, hello: 'world' },
  deep
};
export const exampleLogArgs = {
  printfMixedSimple: ['hello %s %d - %s done %s at %d', 'world', 42, 'foo', 'bar', 123] as const,
  printfMixedComplex: [
    'string %s circular %j simple %j foo %s bar %d',
    'world',
    exampleObjects.circular,
    exampleObjects.simple,
    'foo',
    123
  ] as const
};
export const LOG_METHODS = ['error', 'warn', 'info', 'verbose', 'debug'] as const;
export const loggers = {
  dummyNodeJson: {
    winston: winston.createLogger({
      transports: [
        new winston.transports.Stream({
          stream: devNullStream
        })
      ]
    }),
    pino: pino(devNullStream),
    bunyan: bunyan.createLogger({
      name: 'myapp',
      streams: [
        {
          level: 'trace',
          stream: devNullStream
        }
      ]
    }),
    neodx: createLogger({
      target: neodxLoggerTargets.dummy.json,
      meta: {
        ...NODE_LOGGER_SYSTEM_INFO
      }
    })
  },
  nodeJson: {
    pino: pino(
      {
        name: 'myapp'
      },
      process.stdout
    ),
    neodx: createLogger({
      target: createJsonTarget(),
      name: 'myapp',
      meta: {
        ...NODE_LOGGER_SYSTEM_INFO
      }
    }),
    bunyan: bunyan.createLogger({
      name: 'myapp',
      streams: [
        {
          level: 'trace',
          stream: process.stdout
        }
      ]
    }),
    winston: winston.createLogger({
      defaultMeta: {
        name: 'myapp'
      },
      transports: [
        new winston.transports.Stream({
          stream: process.stdout
        })
      ]
    }),
    loglevel
  }
};

loglevel.setLevel('info');
