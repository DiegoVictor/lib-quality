import axios, { AxiosResponse } from 'axios';
import { differenceInDays, subMonths, format, isAfter } from 'date-fns';

import {
  responseRepository,
  RepositoryRequest,
  RepositoryResponse,
  responseRepositoryOpenedStats,
  responseRepositoryIssuesStats,
  RepoIssuesChartStats,
  RepoOpenedIssuesStats,
  RepoIssuesChartStatsRequest,
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

export const http = axios.create({
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
  const lookForIssuesSince = subMonths(Date.now(), 3);

  const defaultParams = {
    ...defaultGetIssuesParams,
    state: 'all',
    since: lookForIssuesSince.toISOString(),
    page: 1,
  };

  const firstIssuesPage: Promise<{
    fullName: string;
    response: AxiosResponse<RepoIssueRequest[]>;
  }>[] = [];

  const issuesByDate: RepoIssuesChartStatsRequest = {};
  repositories.forEach(fullName => {
    issuesByDate[fullName] = { opened: {}, closed: {} };

    firstIssuesPage.push(
      new Promise(resolve => {
        getRepositoryIssuePagePromise(fullName, defaultParams).then(
          response => {
            resolve({ fullName, response });
          },
        );
      }),
    );
  });

  const promises: Promise<{
    fullName: string;
    data: RepoIssueRequest[];
  }>[] = [];

  const firstIssuesPageResponses = await Promise.all(firstIssuesPage);
  firstIssuesPageResponses.forEach(({ fullName, response }) => {
    const { data: issues, headers } = response;

    issues.forEach(({ created_at, closed_at, pull_request }) => {
      if (!pull_request) {
        const issueCreatedAt = new Date(created_at);

        if (isAfter(issueCreatedAt, lookForIssuesSince)) {
          const createdAtFormated = format(issueCreatedAt, 'dd/MM/yyyy');

          if (issuesByDate[fullName].opened[createdAtFormated]) {
            issuesByDate[fullName].opened[createdAtFormated] += 1;
          } else {
            issuesByDate[fullName].opened[createdAtFormated] = 1;
          }

          repositories.forEach(full_name => {
            issuesByDate[full_name].closed[createdAtFormated] =
              issuesByDate[full_name].closed[createdAtFormated] || 0;

            issuesByDate[full_name].opened[createdAtFormated] =
              issuesByDate[full_name].opened[createdAtFormated] || 0;
          });
        }

        if (closed_at) {
          const issueClosedAt = new Date(closed_at);

          if (isAfter(issueClosedAt, lookForIssuesSince)) {
            const closedAtformated = format(issueClosedAt, 'dd/MM/yyyy');

            if (issuesByDate[fullName].closed[closedAtformated]) {
              issuesByDate[fullName].closed[closedAtformated] += 1;
            } else {
              issuesByDate[fullName].closed[closedAtformated] = 1;
            }

            repositories.forEach(full_name => {
              issuesByDate[full_name].opened[closedAtformated] =
                issuesByDate[full_name].opened[closedAtformated] || 0;

              issuesByDate[full_name].closed[closedAtformated] =
                issuesByDate[full_name].closed[closedAtformated] || 0;
            });
          }
        }
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

      for (let page = 2; page <= lastPage; page += 1) {
        promises.push(
          new Promise(resolve => {
            getRepositoryIssuePagePromise(fullName, {
              ...defaultParams,
              page,
            }).then(({ data }) => {
              resolve({ fullName, data });
            });
          }),
        );
      }
    }
  });

  const responses = await Promise.all(promises);
  responses.forEach(response => {
    const { fullName, data } = response;

    data.forEach(({ created_at, closed_at, pull_request }) => {
      if (!pull_request) {
        const issueCreatedAt = new Date(created_at);

        if (isAfter(issueCreatedAt, lookForIssuesSince)) {
          const createdAtFormated = format(issueCreatedAt, 'dd/MM/yyyy');

          if (issuesByDate[fullName].opened[createdAtFormated]) {
            issuesByDate[fullName].opened[createdAtFormated] += 1;
          } else {
            issuesByDate[fullName].opened[createdAtFormated] = 1;
          }

          repositories.forEach(full_name => {
            issuesByDate[full_name].closed[createdAtFormated] =
              issuesByDate[full_name].closed[createdAtFormated] || 0;

            issuesByDate[full_name].opened[createdAtFormated] =
              issuesByDate[full_name].opened[createdAtFormated] || 0;
          });
        }

        if (closed_at) {
          const issueClosedAt = new Date(closed_at);

          if (isAfter(issueClosedAt, lookForIssuesSince)) {
            const closedAtFormated = format(issueClosedAt, 'dd/MM/yyyy');

            if (issuesByDate[fullName].closed[closedAtFormated]) {
              issuesByDate[fullName].closed[closedAtFormated] += 1;
            } else {
              issuesByDate[fullName].closed[closedAtFormated] = 1;
            }

            repositories.forEach(full_name => {
              issuesByDate[full_name].opened[closedAtFormated] =
                issuesByDate[full_name].opened[closedAtFormated] || 0;

              issuesByDate[full_name].closed[closedAtFormated] =
                issuesByDate[full_name].closed[closedAtFormated] || 0;
            });
          }
        }
      }
    });
  });

  return responseRepositoryIssuesStats(issuesByDate);
};

export const getRepositories = async (
  repositories: string[],
): Promise<RepositoryResponse[]> => {
  const promises: Promise<RepositoryResponse>[] = [];

  repositories.forEach(repository => {
    promises.push(getRepositoryByFullName(repository));
  });

  const responses = await Promise.all(promises);
  return responses;
};
