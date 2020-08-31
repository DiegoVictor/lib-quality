import 'dotenv/config';
import express from 'express';
import { errors } from 'celebrate';

import './database/mongodb';
import routes from './routes';

const app = express();

app.use(express.json());

app.use('/v1/', routes);

app.use(errors());

export default app;
