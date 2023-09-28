import type { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

/* Custom Default Error Handlers */

/* Logs Error */
export const logError =
  () =>
  (err: ICustomError, req: Request, res: Response, next: NextFunction) => {
    if (err?.stack != null) {
      logger.error(err.stack);
    } else {
      logger.error(err != null ? err : 'Internal Server Error');
    }

    next(err);
  };

/* If you want a error handler middleware to send email to you when an
  error occurs it can be placed here
*/

/* Handle XHR Errors */
export const clientErrorHandler =
  () =>
  (err: ICustomError, req: Request, res: Response, next: NextFunction) => {
    if (req.xhr) {
      const statusCode =
        err?.code != null && err?.code !== undefined ? err.code : 500;
      const message =
        err?.message != null && err?.message !== undefined
          ? err.message
          : 'Internal Server Error';

      res.status(statusCode).json({
        status: false,
        message,
      });
    } else {
      next(err);
    }
  };

/* Handle Any Error */
export const generalErrorHandler =
  () =>
  (err: ICustomError, req: Request, res: Response, next: NextFunction) => {
    // If the headers have already been sent to the client then delegate the error
    // handling to the default Express error handler.
    if (res.headersSent) {
      next(err);
    }

    const statusCode =
      err?.code != null && err?.code !== undefined ? err.code : 500;
    const message =
      err?.message != null && err?.message !== undefined
        ? err.message
        : 'Internal Server Error';

    res.status(statusCode).json({
      status: false,
      message,
    });
  };
