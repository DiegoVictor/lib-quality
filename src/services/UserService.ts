import { badRequest, notFound } from '@hapi/boom';
import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';

import UsersRepository from '../repositories/UsersRepository';
import { responseUser, UserResponse } from '../parses/user';
import auth from '../config/auth';

const usersRepository = new UsersRepository();

export const createUser = async (
  email: string,
  password: string,
): Promise<void> => {
  const user = await usersRepository.findOneByEmail(email);

  if (user) {
    throw badRequest('Email already in use', { code: 140 });
  }

  await usersRepository.create(email, password);
};

export const login = async (
  email: string,
  password: string,
): Promise<UserResponse> => {
  const user = await usersRepository.findOneByEmail(email);

  if (!user) {
    throw notFound('User and/or password does not match', { code: 144 });
  }

  if (!(await usersRepository.comparePassword(password, user.password))) {
    throw badRequest('User and/or password does not match', { code: 141 });
  }

  return responseUser(
    user._id,
    jwt.sign({ id: user._id, session: v4() }, auth.secret, {
      expiresIn: auth.expirationTime,
    }),
  );
};
