import { Router } from 'express';

const routes = Router();
const sessionsController = new SessionsController();
routes.post('/v1/users', userValidator, usersController.store);
routes.post('/v1/sessions', userValidator, sessionsController.store);
routes.get('/*', (_, response) => {
  response.status(404).json({
    message: 'Resource not found',
  });
});

export default routes;
