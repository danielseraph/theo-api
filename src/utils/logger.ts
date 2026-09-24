import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, colorize, printf, json, errors } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr =
      Object.keys(meta).length && meta.service === undefined
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const isDev = process.env.NODE_ENV !== 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDev ? devFormat : prodFormat,
  defaultMeta: { service: 'community-api' },
  transports: [
    new transports.Console(),
    ...(isDev
      ? []
      : [
          new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
          }),
          new transports.File({
            filename: path.join('logs', 'combined.log'),
          }),
        ]),
  ],
});

export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
