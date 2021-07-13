import { Request, Response } from 'express';

import {
  getRepositoryOpenedIssuesStats,
  getRepositoryByFullName,
} from '../services/GithubService';
import StatisticsRepository from '../repositories/StatisticsRepository';

const statisticsRepository = new StatisticsRepository();

class GitHubProjectAnalyticsController {
  async show(request: Request, response: Response): Promise<Response> {
    const { user, repository } = request.params;
    const { id, session } = request.user;

    const repo = await getRepositoryByFullName(`${user}/${repository}`);
    const repositoryStats = await getRepositoryOpenedIssuesStats(
      repo.full_name,
    );

    await statisticsRepository.trackSearch(repo.full_name, id, session);

    return response.json(repositoryStats);
  }
}

export default GitHubProjectAnalyticsController;
