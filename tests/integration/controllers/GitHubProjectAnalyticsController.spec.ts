import request from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import Mongoose from 'mongoose';
import faker from 'faker';

import { differenceInDays } from 'date-fns';
import app from '../../../src/app';
import factory from '../../utils/factory';
import User from '../../../src/models/User';
import token from '../../utils/jwtoken';
import { http } from '../../../src/services/GithubService';
import Repository from '../../../src/models/Repository';

interface Repository {
  id: number;
  name: string;
  full_name: string;
}

interface User {
  email: string;
  password: string;
}

interface Issue {
  created_at: string;
  closed_at: string | null;
  pull_request:
    | {
        url: string;
      }
    | undefined
    | null;
}

describe('GitHubProjectAnalyticsController', () => {
  const apiMock = new MockAdapter(http);

  let user_id: string;
  beforeEach(async () => {
    await User.deleteMany({});
    await Repository.deleteMany({});

    const userData = await factory.attrs<User>('User');
    const user = await User.create(userData);

    user_id = user._id;
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to get statistics about a new repo', async () => {
    const repository = await factory.attrs<Repository>('GithubRepository');
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      3,
      Array.from(Array(3).keys()).map(() => ({
        pull_request: null,
      })),
    );
    const authorization = `Bearer ${token(user_id)}`;

    apiMock
      .onGet(`/repos/${repository.full_name}/issues`)
      .reply(200, issues, {})
      .onGet(`/repos/${repository.full_name}`)
      .reply(200, repository);

    const response = await request(app)
      .get(`/v1/analytics/${repository.full_name}`)
      .set('Authorization', authorization)
      .send();

    const average =
      issues.reduce((prev, { created_at }) => {
        return differenceInDays(new Date(), new Date(created_at)) + prev;
      }, 0) / issues.length;

    const deviation = Math.sqrt(
      issues
        .map(({ created_at }) => {
          return (
            (differenceInDays(new Date(), new Date(created_at)) - average) ** 2
          );
        })
        .reduce((sum, days) => {
          return days + sum;
        }, 0) / issues.length,
    );

    expect(response.body).toStrictEqual({
      average,
      deviation,
      name: repository.full_name,
      open_issues: issues.length,
    });

    const repo = await Repository.findOne({
      fullName: repository.full_name,
    });
    expect(repo).toMatchObject({
      fullName: repository.full_name,
      count: 1,
    });
  });

  it('should be able to get statistics about a previous repo', async () => {
    const repository = await factory.attrs<Repository>('GithubRepository');
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      3,
      Array.from(Array(3).keys()).map(() => ({
        pull_request: null,
      })),
    );
    const authorization = `Bearer ${token(user_id)}`;

    await Repository.create({ fullName: repository.full_name, count: 1 });

    apiMock
      .onGet(`/repos/${repository.full_name}/issues`)
      .reply(200, issues, {})
      .onGet(`/repos/${repository.full_name}`)
      .reply(200, repository);

    const response = await request(app)
      .get(`/v1/analytics/${repository.full_name}`)
      .set('Authorization', authorization)
      .send();

    const average =
      issues.reduce((prev, { created_at }) => {
        return differenceInDays(new Date(), new Date(created_at)) + prev;
      }, 0) / issues.length;

    const deviation = Math.sqrt(
      issues
        .map(({ created_at }) => {
          return (
            (differenceInDays(new Date(), new Date(created_at)) - average) ** 2
          );
        })
        .reduce((sum, days) => {
          return days + sum;
        }, 0) / issues.length,
    );

    expect(response.body).toStrictEqual({
      average,
      deviation,
      name: repository.full_name,
      open_issues: issues.length,
    });

    const repo = await Repository.findOne({
      fullName: repository.full_name,
    });
    expect(repo).toMatchObject({
      fullName: repository.full_name,
      count: 2,
    });
  });

  it('should be able to get statistics about one repo with two pages', async () => {
    const repository = await factory.attrs<Repository>('GithubRepository');
    const issuesCount = 6;
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      issuesCount,
      Array.from(Array(issuesCount).keys()).map(index => ({
        pull_request:
          index > 0 && index % 2 === 0 ? { url: faker.internet.url() } : null,
      })),
    );

    const authorization = `Bearer ${token(user_id)}`;

    apiMock
      .onGet(`/repos/${repository.full_name}/issues`, {
        params: {
          direction: 'asc',
          per_page: 100,
          state: 'open',
        },
      })
      .reply(200, issues.slice(0, 3), { link: 'page=2' })
      .onGet(`/repos/${repository.full_name}/issues`, {
        params: {
          page: 2,
          direction: 'asc',
          per_page: 100,
          state: 'open',
        },
      })
      .reply(200, issues.slice(3), {})
      .onGet(`/repos/${repository.full_name}`)
      .reply(200, repository);

    const response = await request(app)
      .get(`/v1/analytics/${repository.full_name}`)
      .set('Authorization', authorization)
      .send();

    const average =
      issues.reduce((prev, { created_at, pull_request }) => {
        if (!pull_request) {
          return differenceInDays(new Date(), new Date(created_at)) + prev;
        }
        return prev;
      }, 0) /
      (issuesCount - 2);

    const deviation = Math.sqrt(
      issues
        .map(({ created_at, pull_request }) => {
          if (!pull_request) {
            return (
              (differenceInDays(new Date(), new Date(created_at)) - average) **
              2
            );
          }
          return 0;
        })
        .reduce((sum, days) => {
          return days + sum;
        }, 0) /
        (issuesCount - 2),
    );

    expect(response.body).toStrictEqual({
      average,
      deviation,
      name: repository.full_name,
      open_issues: issuesCount - 2,
    });
  });

  it('should not be able to get statistics about one repo', async () => {
    const repository = await factory.attrs<Repository>('GithubRepository');
    const authorization = `Bearer ${token(user_id)}`;

    apiMock
      .onGet(`/repos/${repository.full_name}/issues`)
      .reply(400)
      .onGet(`/repos/${repository.full_name}`)
      .reply(200, repository);

    const response = await request(app)
      .get(`/v1/analytics/${repository.full_name}`)
      .set('Authorization', authorization)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
    });
  });
});
