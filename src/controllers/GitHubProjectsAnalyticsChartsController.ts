import { Request, Response } from 'express';

import {
  getRepositories,
  getRepositoryIssuesStats,
} from '../services/GithubService';

interface CustomRequest {
  query: {
    repositories: string[];
  };
}

class GitHubProjectsAnalyticsChartsController {
  async index(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const { repositories } = request.query;

    const repos = await getRepositories(repositories);
    const repositoryStats = await getRepositoryIssuesStats(
      repos.map(({ full_name }) => full_name),
    );

    return response.json(repositoryStats);
  }
}

export default GitHubProjectsAnalyticsChartsController;
