import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaString}`;
  })
);

export const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: env.isProduction ? combine(timestamp(), json()) : devFormat,
  transports: [new winston.transports.Console()]
});
