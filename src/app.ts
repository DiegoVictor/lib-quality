import 'dotenv/config';
import 'express-async-errors';
import express, { Response, NextFunction, Request } from 'express';
import { errors } from 'celebrate';
import { isBoom, notFound } from '@hapi/boom';
import helmet from 'helmet';
import cors from 'cors';
import swagger from 'swagger-ui-express';

import './database/mongodb';
import swaggerDocument from './swagger.json';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/docs', swagger.serve, swagger.setup(swaggerDocument));
app.use('/v1/', routes);

app.all('/*', () => {
  throw notFound('Resource not found', { code: 440 });
});

app.use(errors());
app.use((err: Error, _: Request, response: Response, next: NextFunction) => {
  if (isBoom(err)) {
    const { statusCode, payload } = err.output;

    return response.status(statusCode).json({
      ...payload,
      ...err.data,
    });
  }

  return next(err);
});

export default app;
