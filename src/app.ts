import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import responseTime from '@middlewares/v1/response-time';
import responseHeaders from '@middlewares/v1/response-headers';
import v1TeamRouter from '@src/routes/v1/team';
import v1FixtureRouter from '@src/routes/v1/fixture';
import v1StandingRouter from '@src/routes/v1/standing';
import v1NewsRouter from '@src/routes/v1/news';
import swaggerDoc from '@utils/swagger';
import swaggerUi from 'swagger-ui-express';
import {
  logError,
  clientErrorHandler,
  generalErrorHandler,
} from '@middlewares/v1/error-handler';
import CustomError, { ErrorCode, ErrorType } from '@utils/custom-error';

const app = express();
app.use(responseTime()); // Logs response time for http requests
app.disable('x-powered-by'); // Disabling 'X-Powered-By' response header
app.use(helmet());
app.use(responseHeaders()); // Adding HTTP response headers
app.use(compression()); // For compressing the body of the responses
app.use(express.json({ limit: '5mb' })); // For handling json data
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For handling form data
app.use(express.static(path.join(process.cwd(), 'public'))); // Defining folder containing Static files

/* routes */
app.use('/v1/teams', v1TeamRouter); // For getting Teams Data
app.use('/v1/fixtures', v1FixtureRouter); // For getting Fixtures
app.use('/v1/standings', v1StandingRouter); // For getting Standings
app.use('/v1/news', v1NewsRouter); // For getting news data

/* Swagger Routes */
app.use(
  '/docs',
  (req: Request, res: Response, next: NextFunction) => {
    res.header(
      'Content-Security-Policy',
      "default-src 'self';base-uri 'self';connect-src 'self';font-src 'self';form-action 'self';frame-ancestors 'self';img-src 'self' data:;media-src 'self';object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' 'unsafe-inline';upgrade-insecure-requests;"
    ); // Content-Security-Policy header(img-src and style-src changed for swagger ui)
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc)
);
app.use('/docs.json', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(swaggerDoc);
  } catch (error: any) {
    const err = new CustomError(
      'Error while serving swagger documentation in json format',
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorType.SERVER
    );
    next(err);
  }
});

/* Root Endpoint */
app.use('/', (req: Request, res: Response) => {
  res.status(200).send('API is working...');
});

/* Custom 404 Middleware */
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new CustomError(
    `Not Found - ${req.baseUrl + req.originalUrl}`,
    ErrorCode.NOT_FOUND,
    ErrorType.NOT_FOUND
  );

  next(err);
});

app.use(logError());
app.use(clientErrorHandler());
app.use(generalErrorHandler());

export default app;
