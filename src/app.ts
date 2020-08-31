import 'dotenv/config';
import express from 'express';
import { errors } from 'celebrate';
const app = express();

app.use(express.json());
app.use(errors());

export default app;
