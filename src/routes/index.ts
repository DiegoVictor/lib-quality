import { Router } from 'express';

import GitHubProjectsController from '../controllers/GitHubProjectsController';
import GitHubProjectAnalyticsController from '../controllers/GitHubProjectAnalyticsController';
import GitHubProjectAnalyticChartsController from '../controllers/GitHubProjectAnalyticChartsController';
import UsersController from '../controllers/UsersController';
import SessionsController from '../controllers/SessionsController';

import projectNameValidator from '../validators/projectNameValidator';
import githubRepositoryNameValidator from '../validators/githubRepositoryNameValidator';
import userValidator from '../validators/userValidator';
import Auth from '../middlewares/Auth';

const routes = Router();

const gitHubProjectsController = new GitHubProjectsController();
const gitHubProjectAnalyticsController = new GitHubProjectAnalyticsController();
const gitHubProjectAnalyticChartsController = new GitHubProjectAnalyticChartsController();
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

routes.get(
  '/analytics/:user/:repository',
  githubRepositoryNameValidator,
  gitHubProjectAnalyticsController.show,
);

routes.get('/analytics/chart', gitHubProjectAnalyticChartsController.show);

export default routes;
