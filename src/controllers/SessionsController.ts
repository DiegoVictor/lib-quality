import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { Request, Response } from 'express';

import { login } from '../services/UserService';
import auth from '../config/auth';

class SessionsController {
  async store(request: Request, response: Response): Promise<void> {
    const { email, password } = request.body;

    const { _id } = await login(email, password);

    response.json({
      user: { _id },
      token: jwt.sign({ id: _id, session: v4() }, auth.secret, {
        expiresIn: auth.expirationTime,
      }),
    });
  }
}

export default SessionsController;
