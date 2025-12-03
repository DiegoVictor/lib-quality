import request from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { format, subMonths, addDays, subDays, isAfter } from 'date-fns';

import app from '../../src/app';
import factory from '../utils/factory';
import { User, IUser } from '../../src/models/User';
import token from '../utils/jwtoken';
import { http } from '../../src/services/GithubService';
import { IRepository } from '../../src/models/Repository';

interface Issue {
  created_at: string;
  closed_at: string | null;
  pull_request: { url: string } | undefined | null;
}

interface Dataset {
  label: string;
  borderColor: string;
  data: number[];
  backgroundColor: string;
}

const apiMock = new MockAdapter(http);

describe('GitHubProjectsAnalyticsChartsController', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const userData = await factory.attrs<IUser>('User');
    const user = await User.create(userData);

    user_id = user._id;
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to get data to chart line', async () => {
    const minDate = subMonths(new Date(), 1);
    const [repo1, repo2] = await factory.attrsMany<IRepository>(
      'GithubRepository',
      2,
    );
    const issues = await factory.attrsMany<Issue>('Issue', 12, [
      {
        pull_request: null,
        created_at: addDays(minDate, 1).toISOString(),
        closed_at: addDays(minDate, 2).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 1).toISOString(),
        closed_at: addDays(minDate, 1).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 2).toISOString(),
        closed_at: addDays(minDate, 2).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 3).toISOString(),
        closed_at: addDays(minDate, 4).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 3).toISOString(),
        closed_at: addDays(minDate, 3).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 4).toISOString(),
        closed_at: addDays(minDate, 4).toISOString(),
      },

      {
        pull_request: null,
        created_at: addDays(minDate, 1).toISOString(),
        closed_at: addDays(minDate, 2).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 1).toISOString(),
        closed_at: addDays(minDate, 1).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 2).toISOString(),
        closed_at: addDays(minDate, 2).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 2).toISOString(),
        closed_at: addDays(minDate, 1).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 2).toISOString(),
        closed_at: addDays(minDate, 2).toISOString(),
      },
      {
        pull_request: null,
        created_at: addDays(minDate, 1).toISOString(),
        closed_at: addDays(minDate, 1).toISOString(),
      },
    ]);
    const authorization = `Bearer ${token(user_id)}`;

    const now = new Date();
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return now.getTime();
    });
    const lookForIssuesSince = subMonths(now, 3);

    apiMock
      .onGet(`/repos/${repo1.full_name}`)
      .reply(200, repo1)
      .onGet(`/repos/${repo2.full_name}`)
      .reply(200, repo2)

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(0, 3), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(3, 6), {})

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(6, 9), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(9), {});

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    const labels: string[] = [];
    issues.forEach(issue => {
      const openedFormated = format(new Date(issue.created_at), 'dd/MM/yyyy');
      if (!labels.includes(openedFormated)) {
        labels.push(openedFormated);
      }

      if (issue.closed_at) {
        const closedFormated = format(new Date(issue.closed_at), 'dd/MM/yyyy');
        if (!labels.includes(closedFormated)) {
          labels.push(closedFormated);
        }
      }
    });

    const datasets: Dataset[] = [];
    [repo1, repo2].forEach(repo => {
      datasets.push({
        label: `${repo.full_name} - Opened Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
      datasets.push({
        label: `${repo.full_name} - Closed Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
    });

    expect(response.body.labels.sort()).toStrictEqual(labels.sort());
    expect(response.body.datasets).toMatchObject(datasets);
  });

  it('should be able to get data to chart line with some missing fields', async () => {
    const minDate = subMonths(new Date(), 1);
    const [repo1, repo2] = await factory.attrsMany<IRepository>(
      'GithubRepository',
      2,
    );
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      12,
      Array.from(Array(12).keys()).map(value => {
        return {
          pull_request: value % 3 === 0 ? { url: faker.internet.url() } : null,
          created_at: addDays(minDate, value).toISOString(),
          closed_at:
            value % 3 === 0 ? addDays(minDate, value).toISOString() : null,
        };
      }),
    );
    const authorization = `Bearer ${token(user_id)}`;

    const now = new Date();
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return now.getTime();
    });
    const lookForIssuesSince = subMonths(now, 3);

    apiMock
      .onGet(`/repos/${repo1.full_name}`)
      .reply(200, repo1)
      .onGet(`/repos/${repo2.full_name}`)
      .reply(200, repo2)

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(0, 3), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(3, 6), {})

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(6, 9), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(9), {});

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    const labels: string[] = [];
    issues.forEach(issue => {
      if (!issue.pull_request) {
        const openedFormated = format(new Date(issue.created_at), 'dd/MM/yyyy');
        if (!labels.includes(openedFormated)) {
          labels.push(openedFormated);
        }

        if (issue.closed_at) {
          const closedFormated = format(
            new Date(issue.closed_at),
            'dd/MM/yyyy',
          );
          if (!labels.includes(closedFormated)) {
            labels.push(closedFormated);
          }
        }
      }
    });

    const datasets: Dataset[] = [];
    [repo1, repo2].forEach(repo => {
      datasets.push({
        label: `${repo.full_name} - Opened Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
      datasets.push({
        label: `${repo.full_name} - Closed Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
    });

    expect(response.body.labels.sort()).toStrictEqual(labels.sort());
    expect(response.body.datasets).toMatchObject(datasets);
  });

  it('should be able to get data to chart line out of range dates', async () => {
    const minDate = subMonths(new Date(), 3);
    const [repo1, repo2] = await factory.attrsMany<IRepository>(
      'GithubRepository',
      2,
    );
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      12,
      Array.from(Array(12).keys()).map(value => {
        return {
          pull_request: null,
          created_at:
            value % 3 === 0
              ? addDays(minDate, value).toISOString()
              : subDays(minDate, value).toISOString(),
          closed_at:
            value % 3 === 0
              ? addDays(minDate, value).toISOString()
              : subDays(minDate, value).toISOString(),
        };
      }),
    );
    const authorization = `Bearer ${token(user_id)}`;

    const now = new Date();
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return now.getTime();
    });
    const lookForIssuesSince = subMonths(now, 3);

    apiMock
      .onGet(`/repos/${repo1.full_name}`)
      .reply(200, repo1)
      .onGet(`/repos/${repo2.full_name}`)
      .reply(200, repo2)

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(0, 3), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(3, 6), {})

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(6, 9), {
        link: 'page=2',
      })

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 2,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(9), {});

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    const labels: string[] = [];
    issues.forEach(issue => {
      const openedFormated = format(new Date(issue.created_at), 'dd/MM/yyyy');
      if (
        isAfter(new Date(issue.created_at), minDate) &&
        !labels.includes(openedFormated)
      ) {
        labels.push(openedFormated);
      }

      if (issue.closed_at) {
        const closedFormated = format(new Date(issue.closed_at), 'dd/MM/yyyy');
        if (
          isAfter(new Date(issue.closed_at), minDate) &&
          !labels.includes(closedFormated)
        ) {
          labels.push(closedFormated);
        }
      }
    });

    const datasets: Dataset[] = [];
    [repo1, repo2].forEach(repo => {
      datasets.push({
        label: `${repo.full_name} - Opened Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
      datasets.push({
        label: `${repo.full_name} - Closed Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
    });

    expect(response.body.labels.sort()).toStrictEqual(labels.sort());
    expect(response.body.datasets).toMatchObject(datasets);
  });

  it('should be able to get one page of issues of data to chart line', async () => {
    const minDate = subMonths(new Date(), 3);
    const [repo1, repo2] = await factory.attrsMany<IRepository>(
      'GithubRepository',
      2,
    );
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      6,
      Array.from(Array(6).keys()).map(() => {
        return {
          pull_request: null,
          created_at: addDays(minDate, 1).toISOString(),
          closed_at: addDays(minDate, 1).toISOString(),
        };
      }),
    );
    const authorization = `Bearer ${token(user_id)}`;

    const now = new Date();
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return now.getTime();
    });
    const lookForIssuesSince = subMonths(now, 3);

    apiMock
      .onGet(`/repos/${repo1.full_name}`)
      .reply(200, repo1)
      .onGet(`/repos/${repo2.full_name}`)
      .reply(200, repo2)

      .onGet(`/repos/${repo1.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(0, 3), {})

      .onGet(`/repos/${repo2.full_name}/issues`, {
        params: {
          page: 1,
          since: lookForIssuesSince.toISOString(),
          state: 'all',
          direction: 'asc',
          per_page: 100,
        },
      })
      .reply(200, issues.slice(3), {});

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    const labels: string[] = [];
    issues.forEach(issue => {
      const openedFormated = format(new Date(issue.created_at), 'dd/MM/yyyy');
      if (!labels.includes(openedFormated)) {
        labels.push(openedFormated);
      }

      if (issue.closed_at) {
        const closedFormated = format(new Date(issue.closed_at), 'dd/MM/yyyy');
        if (!labels.includes(closedFormated)) {
          labels.push(closedFormated);
        }
      }
    });

    const datasets: Dataset[] = [];
    [repo1, repo2].forEach(repo => {
      datasets.push({
        label: `${repo.full_name} - Opened Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
      datasets.push({
        label: `${repo.full_name} - Closed Issues`,
        borderColor: expect.any(String),
        data: expect.any(Array),
        backgroundColor: 'transparent',
      });
    });

    expect(response.body.labels.sort()).toStrictEqual(labels.sort());
    expect(response.body.datasets).toMatchObject(datasets);
  });

  it('should not be able to get data to chart line', async () => {
    const [repo1, repo2] = await factory.attrsMany<IRepository>(
      'GithubRepository',
      2,
    );
    const authorization = `Bearer ${token(user_id)}`;

    apiMock.onGet(`/repos/${repo1.full_name}`).reply(404);

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    expect(response.body).toStrictEqual({
      code: 351,
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
    });
  });
});
