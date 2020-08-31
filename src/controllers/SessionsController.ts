import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { Request, Response } from 'express';

import UsersRepository from '../repositories/UsersRepository';

const usersRepository = new UsersRepository();

class SessionsController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const user = await usersRepository.findOneByEmail(email);

    if (!user) {
      return response.status(404).json({
        message: 'User not found or not exists',
      });
    }

    if (!usersRepository.comparePassword(password, user.password)) {
      return response.status(400).json({
        message: 'User and/or password not match',
      });
    }

    return response.json({
      user: { _id: user._id },
      token: jwt.sign(
        { id: user._id, session: v4() },
        process.env.JWT_SECRET || '',
        {
          expiresIn: process.env.JWT_EXPIRATION_TIME || '7d',
        },
      ),
    });
  }
}

export default SessionsController;
