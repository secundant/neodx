import { isTypeOfString } from '@neodx/std';
import { type BinaryLike, createHash } from 'node:crypto';
import hashObject from 'object-hash';

export const hashContent = (content: BinaryLike) =>
  createHash('sha256').update(content).digest('hex');
export const hashUnknown = (value: unknown) =>
  Buffer.isBuffer(value) || isTypeOfString(value) ? hashContent(value) : hashObject(value ?? '');

export const printHash = (pattern: string, hash: string, name = 'hash') =>
  pattern
    .replace(new RegExp(`\\{${name}:(\\d)}`, 'g'), (_, length) => hash.slice(0, Number(length)))
    .replace(`{${name}}`, hash);

export const shortHash = (value: unknown) => hashUnknown(value).slice(0, 8);
