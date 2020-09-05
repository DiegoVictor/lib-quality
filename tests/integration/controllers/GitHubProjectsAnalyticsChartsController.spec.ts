import request from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import Mongoose from 'mongoose';

import { format } from 'date-fns';
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

interface Dataset {
  label: string;
  borderColor: string;
  data: number[];
  backgroundColor: string;
}

describe('GitHubProjectsAnalyticsChartsController', () => {
  const apiMock = new MockAdapter(http);

  let user_id: string;
  beforeEach(async () => {
    await User.deleteMany({});

    const userData = await factory.attrs<User>('User');
    const user = await User.create(userData);

    user_id = user._id;
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to get data to chart line', async () => {
    const [repo1, repo2] = await factory.attrsMany<Repository>(
      'GithubRepository',
      2,
    );
    const issues = await factory.attrsMany<Issue>(
      'Issue',
      6,
      Array.from(Array(6).keys()).map(() => ({
        pull_request: null,
        created_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
      })),
    );
    const authorization = `Bearer ${token(user_id)}`;

    apiMock
      .onGet(`/repos/${repo1.full_name}`)
      .reply(200, repo1)
      .onGet(`/repos/${repo1.full_name}/issues`)
      .reply(200, issues.slice(0, 3), {})
      .onGet(`/repos/${repo2.full_name}`)
      .reply(200, repo2)
      .onGet(`/repos/${repo2.full_name}/issues`)
      .reply(200, issues.slice(-3), {});

    const response = await request(app)
      .get(
        `/v1/analytics/chart?repositories[0]=${repo1.full_name}&repositories[1]=${repo2.full_name}`,
      )
      .set('Authorization', authorization)
      .send();

    const labels: string[] = [];
    issues.forEach(issue => {
      const formatedDate = format(new Date(issue.created_at), 'dd/MM/yyyy');

      if (!labels.includes(formatedDate)) {
        labels.push(formatedDate);
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

    expect(response.body).toMatchObject({
      labels,
      datasets,
    });
  });

  it('should not be able to get data to chart line', async () => {
    const [repo1, repo2] = await factory.attrsMany<Repository>(
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
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
    });
  });
});
