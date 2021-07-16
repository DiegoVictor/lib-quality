import { Request, Response } from 'express';

import { searchRepositoryByName } from '../services/GithubService';

class GitHubProjectsController {
  async index(request: Request, response: Response): Promise<Response> {
    const { projectName } = request.params;

    const repositories = await searchRepositoryByName(projectName);
    return response.json(repositories);
  }
}

export default GitHubProjectsController;
