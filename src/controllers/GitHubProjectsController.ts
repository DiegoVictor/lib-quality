import { Request, Response } from 'express';

import { badImplementation } from '@hapi/boom';
import { searchRepositoryByName } from '../services/GithubService';

class GitHubProjectsController {
  async index(request: Request, response: Response): Promise<Response> {
    const { projectName } = request.params;

    try {
      const repositories = await searchRepositoryByName(projectName);
      return response.json(repositories);
    } catch (err) {
      throw badImplementation(
        'An error occured while trying to get repositories list',
      );
    }
  }
}

export default GitHubProjectsController;
