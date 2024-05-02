import request from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import { User, IUser } from '../../src/models/User';
import token from '../utils/jwtoken';
import { http } from '../../src/services/GithubService';

interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
}

describe('GitHubProjectsController', () => {
  const apiMock = new MockAdapter(http);

  let user_id: string;
  beforeEach(async () => {
    await User.deleteMany({});

    const userData = await factory.attrs<IUser>('User');
    const user = await User.create(userData);

    user_id = user._id;
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to get a list of repositories suggestions', async () => {
    const repositories = await factory.attrsMany<GithubRepository>(
      'GithubRepository',
      3,
    );
    const authorization = `Bearer ${token(user_id)}`;

    apiMock.onGet('/search/repositories').reply(200, { items: repositories });

    const response = await request(app)
      .get('/v1/repositories/react')
      .set('Authorization', authorization)
      .send();

    repositories.forEach(({ id, name, full_name }) => {
      expect(response.body).toContainEqual({ id, name, full_name });
    });
  });

  it('should not be able to get a list of repositories suggestions', async () => {
    const authorization = `Bearer ${token(user_id)}`;

    apiMock.onGet('/search/repositories').reply(400);

    const response = await request(app)
      .get('/v1/repositories/react')
      .set('Authorization', authorization)
      .send();

    expect(response.body).toStrictEqual({
      code: 350,
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
    });
  });
});
