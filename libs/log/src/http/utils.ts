import { IncomingMessage, OutgoingMessage } from 'http';
import type { Colors } from '@neodx/colors';
import { truncateString } from '@neodx/std';

export const formatOutgoingMessageStatus = (res: OutgoingMessage) => {
  if (!res.headersSent) return 'unknown status';
  const { statusCode, statusMessage } = res as any;

  return `${statusCode} ${statusMessage}`;
};

export const formatIncomingMessage = (req: IncomingMessage, colors: Colors, delimiter = ' ') =>
  `${colors.bold(req.method?.toUpperCase() ?? 'GET')}${delimiter}${colors.underline(
    colors.gray(truncateString(getIncomingMessageUrl(req).split('?')?.shift() ?? '', 50))
  )}`;

export const formatResponseTime = (time: number) => {
  const showSeconds = time >= 100;
  const timeValue = showSeconds ? time / 1000 : time;

  return timeValue
    .toLocaleString('en', {
      style: 'unit',
      unit: showSeconds ? 'second' : 'millisecond',
      unitDisplay: 'narrow',
      maximumFractionDigits: 1
    })
    .padEnd(4);
};

export function serializeHttpRequest(req: IncomingMessage) {
  const { id, info, query, method, params, headers, [HTTP_LOG_RAW_SYMBOL]: raw } = req as any;
  const connection = info || req.socket;

  return {
    id: typeof id === 'function' ? id() : id ?? info?.id,
    url: getIncomingMessageUrl(req),
    query,
    params,
    method,
    headers,
    remotePort: connection?.remotePort,
    remoteAddress: connection?.remoteAddress,
    [HTTP_LOG_RAW_SYMBOL]: raw || req
  };
}

export function serializeHttpResponse(res: OutgoingMessage) {
  return {
    statusCode: res.headersSent ? (res as any).statusCode : null,
    headers: res.getHeaders(),
    [HTTP_LOG_RAW_SYMBOL]: res
  };
}

export const getIncomingMessageUrl = ({ originalUrl, path, url }: any) =>
  originalUrl || (typeof path === 'string' ? path : url?.path ?? url);

export const createRequestIdGenerator = () => {
  let currentRequestId = 0;

  return function generateRequestId() {
    currentRequestId = currentRequestId >= maxInt ? 0 : currentRequestId + 1;

    return currentRequestId;
  };
};

export const HTTP_LOG_START_TIME_SYMBOL = Symbol('HTTP_LOG_START_TIME');
export const HTTP_LOG_RAW_SYMBOL = Symbol('raw');

const maxInt = 2147483647;
