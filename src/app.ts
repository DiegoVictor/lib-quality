import 'dotenv/config';
import express from 'express';
import { errors } from 'celebrate';
import './database/mongodb';
const app = express();

app.use(express.json());
app.get('/*', (_, response) => {
  response.status(404).json({
    message: 'Resource not found',
  });
});

app.use(errors());

export default app;
