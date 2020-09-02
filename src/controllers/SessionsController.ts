import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { Request, Response } from 'express';

import { login } from '../services/UserService';

class SessionsController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const user = await login(email, password);

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
