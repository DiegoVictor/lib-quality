import { Router } from 'express';

const routes = Router();
routes.get('/*', (_, response) => {
  response.status(404).json({
    message: 'Resource not found',
  });
});

export default routes;
