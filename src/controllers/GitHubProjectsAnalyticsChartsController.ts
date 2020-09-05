import { Request, Response } from 'express';
import { badImplementation } from '@hapi/boom';

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
  async show(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const { repositories } = request.query;

    try {
      const repos = await getRepositories(repositories);
      const repositoryStats = await getRepositoryIssuesStats(
        repos.map(({ full_name }) => full_name),
      );

      return response.json(repositoryStats);
    } catch (err) {
      console.log(err);

      throw badImplementation(
        'An error occured while getting issues statistics',
      );
    }
  }
}

export default GitHubProjectsAnalyticsChartsController;
