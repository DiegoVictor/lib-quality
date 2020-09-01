import 'dotenv/config';
import express from 'express';
import { errors } from 'celebrate';
import helmet from 'helmet';
import cors from 'cors';

import './database/mongodb';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/v1/', routes);

app.use(errors());

export default app;
