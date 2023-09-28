import { createLogger, format, transports } from 'winston';

const appDir = process.cwd();

const errorFileTransportOptions: transports.FileTransportOptions = {
  filename: `${appDir}/logs/error.log`,
  level: 'error',
};

const combinedFileTransportOptions: transports.FileTransportOptions = {
  filename: `${appDir}/logs/combined.log`,
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'thesports-api-backend' },
  transports: [
    new transports.File(errorFileTransportOptions),
    new transports.File(combinedFileTransportOptions),
  ],
});

// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;
