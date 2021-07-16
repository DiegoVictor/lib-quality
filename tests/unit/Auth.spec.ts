import request from 'supertest';
import faker from 'faker';
import Mongoose from 'mongoose';

import app from '../../src/app';

describe('Auth middleware', () => {
  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should not be able to be authorized without token', async () => {
    const response = await request(app).get('/v1/auth');

    expect(response.body).toStrictEqual({
      code: 240,
      statusCode: 400,
      error: 'Bad Request',
      message: 'Missing authorization token',
    });
  });

  it('should not be able to be authorized with invalid token', async () => {
    const authorization = faker.random.alphaNumeric(16);
    const response = await request(app)
      .get('/v1/auth')
      .set('Authorization', authorization);

    expect(response.body).toStrictEqual({
      attributes: {
        code: 241,
        error: 'Token expired or invalid',
      },
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token expired or invalid',
    });
  });
});
