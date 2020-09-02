import { Router } from 'express';

import GitHubProjectsController from '../controllers/GitHubProjectsController';
import UsersController from '../controllers/UsersController';
import SessionsController from '../controllers/SessionsController';

import projectNameValidator from '../validators/projectNameValidator';
import userValidator from '../validators/userValidator';
import Auth from '../middlewares/Auth';

const routes = Router();

const gitHubProjectsController = new GitHubProjectsController();
const usersController = new UsersController();
const sessionsController = new SessionsController();

routes.post('/users', userValidator, usersController.store);
routes.post('/sessions', userValidator, sessionsController.store);

routes.use(Auth);

routes.get(
  '/:projectName',
  projectNameValidator,
  gitHubProjectsController.show,
);
export default routes;
