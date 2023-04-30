import { hostname } from 'node:os';

export const NODE_LOGGER_SYSTEM_INFO = { pid: process.pid, hostname: hostname() };
