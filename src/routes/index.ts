import { Router } from 'express';

import UsersController from '../controllers/UsersController';
import SessionsController from '../controllers/SessionsController';
import userValidator from '../validators/userValidator';
const routes = Router();
const usersController = new UsersController();
const sessionsController = new SessionsController();

routes.post('/users', userValidator, usersController.store);
routes.post('/sessions', userValidator, sessionsController.store);
routes.get('/*', (_, response) => {
  response.status(404).json({
    message: 'Resource not found',
  });
});

export default routes;
