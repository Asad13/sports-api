import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject } from 'zod';
import logger from '@utils/logger';

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      logger.error(error.errors);
      res.status(400).json({
        status: false,
        message: `${error.errors[0].message as string}`, // in ${error.errors[0].path[1] as string}
      });
    }
  };

export default validate;
