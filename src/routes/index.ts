import { Router } from 'express';

import UsersController from '../controllers/UsersController';
import SessionsController from '../controllers/SessionsController';
import userValidator from '../validators/userValidator';
import Auth from '../middlewares/Auth';
const routes = Router();
const usersController = new UsersController();
const sessionsController = new SessionsController();

routes.post('/users', userValidator, usersController.store);
routes.post('/sessions', userValidator, sessionsController.store);

routes.use(Auth);

export default routes;
