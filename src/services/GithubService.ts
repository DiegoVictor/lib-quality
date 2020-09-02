import axios, { AxiosResponse } from 'axios';
import { differenceInDays, subMonths, format, isAfter } from 'date-fns';

import {
  responseRepository,
  RepositoryRequest,
  RepositoryResponse,
  responseRepositoryOpenedStats,
  RepoIssuesChartStats,
  RepoOpenedIssuesStats,
} from '../parses/github';

interface RepoSearchResult {
  items: RepositoryRequest[];
}

interface RepoIssueRequest {
  created_at: string;
  closed_at: string | null;
  pull_request: {
    url: string;
  };
}

const http = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

const defaultGetIssuesParams = {
  direction: 'asc',
  per_page: 100,
};

export const searchRepositoryByName = async (
  q: string,
): Promise<RepositoryResponse[]> => {
  const { data } = await http.get<RepoSearchResult>('/search/repositories', {
    params: { q, order: 'desc' },
  });

  return data.items
    .slice(0, 10)
    .map(repository => responseRepository(repository));
};

export const getRepositoryByFullName = async (
  fullName: string,
): Promise<RepositoryResponse> => {
  const { data: repo } = await http.get<RepositoryRequest>(
    `/repos/${fullName}`,
  );
  return repo;
};

const getRepositoryIssuePagePromise = async (
  fullName: string,
  params: { [key: string]: string | number },
) => {
  return http.get<RepoIssueRequest[]>(`/repos/${fullName}/issues`, {
    params,
  });
};

export const getRepositoryOpenedIssuesStats = async (
  fullName: string,
): Promise<RepoOpenedIssuesStats> => {
  const openedIssuesDaysCount: number[] = [];
  const defaultParams = {
    ...defaultGetIssuesParams,
    state: 'open',
  };

  const { data: issues, headers } = await getRepositoryIssuePagePromise(
    fullName,
    defaultParams,
  );
  issues.forEach(({ created_at, pull_request }) => {
    if (!pull_request) {
      openedIssuesDaysCount.push(
        differenceInDays(new Date(), new Date(created_at)),
      );
    }
  });

  if (headers.link) {
    const end = headers.link.split(',').pop();

    const lastPage = parseInt(
      end
        .match(/page=\d+/i)[0]
        .split('=')
        .pop(),
      10,
    );

    const promises = [];
    for (let page = 2; page <= lastPage; page += 1) {
      promises.push(
        getRepositoryIssuePagePromise(fullName, {
          ...defaultParams,
          page,
        }),
      );
    }

    const responses = await Promise.all(promises);
    responses.forEach(response => {
      response.data.forEach(({ created_at, pull_request }) => {
        if (!pull_request) {
          openedIssuesDaysCount.push(
            differenceInDays(new Date(), new Date(created_at)),
          );
        }
      });
    });
  }

  const openedIssuesCount = openedIssuesDaysCount.length;
  const average =
    openedIssuesDaysCount.reduce((sum, days) => sum + days, 0) /
    openedIssuesCount;

  const deviation = Math.sqrt(
    openedIssuesDaysCount
      .map(days => (days - average) ** 2)
      .reduce((sum, days) => sum + days, 0) / openedIssuesCount,
  );

  return responseRepositoryOpenedStats(
    fullName,
    openedIssuesCount,
    average,
    deviation,
  );
};

export const getRepositoryIssuesStats = async (
  repositories: string[],
): Promise<RepoIssuesChartStats> => {
};
};
