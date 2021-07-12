import { Request, Response } from 'express';

import { login } from '../services/UserService';

class SessionsController {
  async store(request: Request, response: Response): Promise<void> {
    const { email, password } = request.body;

    const { _id, token } = await login(email, password);

    response.json({
      user: { _id },
      token,
    });
  }
}

export default SessionsController;
