import { Request, Response } from 'express';

import { searchRepositoryByName } from '../services/GithubService';

class GitHubProjectsController {
  async show(request: Request, response: Response): Promise<Response> {
    const { projectName } = request.params;

    try {
      const repositories = await searchRepositoryByName(projectName);
      return response.json(repositories);
    } catch (err) {
      return response.status(500).json({
        message: 'An error occured while trying to get repositories list',
      });
    }
  }
}

export default GitHubProjectsController;
