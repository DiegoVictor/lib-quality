import request from 'supertest';
import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import app from '../../src/app';
import { IUser, User } from '../../src/models/User';
import factory from '../utils/factory';
import UsersRepository from '../../src/repositories/UsersRepository';

describe('Session controller', () => {
  const usersRepository = new UsersRepository();
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to login', async () => {
    const { email, password } = await factory.attrs<IUser>('User');
    const user = await usersRepository.create(email, password);
    const response = await request(app)
      .post('/v1/sessions')
      .send({ email, password });

    expect(response.body).toMatchObject({
      user: { _id: user._id.toString() },
      token: expect.any(String),
    });
  });

  it('should not be able to login with user that not exists', async () => {
    const { email, password } = await factory.attrs<IUser>('User');
    const response = await request(app)
      .post('/v1/sessions')
      .expect(404)
      .send({ email, password });

    expect(response.body).toStrictEqual({
      code: 144,
      statusCode: 404,
      error: 'Not Found',
      message: 'User and/or password does not match',
    });
  });

  it('should not be able to login', async () => {
    const wrong_password = faker.internet.password();
    const { email, password } = await factory.attrs<IUser>('User');

    await usersRepository.create(email, password);

    const response = await request(app)
      .post('/v1/sessions')
      .expect(400)
      .send({ email, password: wrong_password });

    expect(response.body).toMatchObject({
      code: 141,
      statusCode: 400,
      error: 'Bad Request',
      message: 'User and/or password does not match',
    });
  });
});
