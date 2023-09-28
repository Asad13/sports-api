import type { Request, Response, NextFunction } from 'express';
import CustomError, { ErrorCode, ErrorType } from '@utils/custom-error';
import whiteListedOrigins from '@configs/white-listed-origins';

const responseHeaders =
  () => (req: Request, res: Response, next: NextFunction) => {
    const origin: string | undefined = req.headers.origin;

    let isAllowedOrigin = false;
    if (origin !== undefined) {
      for (const url of whiteListedOrigins) {
        if (url.test(origin)) {
          isAllowedOrigin = true;
          break;
        }
      }
    }

    isAllowedOrigin = true; // temporary: Allowing All domains

    if (isAllowedOrigin || origin === undefined) {
      res.header(
        'Strict-Transport-Security',
        'max-age=63072000;includeSubDomains;preload'
      ); // Informs browsers that the site should only be accessed using HTTPS
      /* For preload have to add the domain to chrome's preload list for https in https://hstspreload.org/ */
      res.header(
        'Content-Security-Policy',
        "default-src 'self';base-uri 'self';connect-src 'self';font-src 'self';form-action 'self';frame-ancestors 'self';img-src 'self';media-src 'self';object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self';upgrade-insecure-requests;"
      ); // Content-Security-Policy header
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE'
      ); // Allowed HTTP Methods
      res.header('Access-Control-Allow-Origin', origin); // For CORS support
      res.header('Vary', 'Origin');
      // if (origin !== undefined) {
      //   res.header('Access-Control-Allow-Origin', origin); // For CORS support
      //   res.header('Access-Control-Allow-Credentials', 'true'); // For Cookie support
      // }
      res.header('Access-Control-Allow-Credentials', 'true'); // For Cookie support
      next();
    } else {
      const error = new CustomError(
        'Not allowed by CORS',
        ErrorCode.FORBIDDEN,
        ErrorType.CORS
      );
      throw error as ICustomError;
    }
  };

export default responseHeaders;
