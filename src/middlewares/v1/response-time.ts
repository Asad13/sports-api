import type { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

const logResponseTime = (req: Request, start: bigint): void => {
  const end = process.hrtime.bigint();
  const total = end - start;
  const beforeDecimal = (total / 1000000n).toString();
  const afterDecimal = (total % 1000000n).toString();
  logger.info(
    `${req.method} ${req.originalUrl} ${beforeDecimal}.${afterDecimal}ms`
  );
};

const responseTime =
  () => (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      logResponseTime(req, start);
    });

    next();
  };

export default responseTime;
