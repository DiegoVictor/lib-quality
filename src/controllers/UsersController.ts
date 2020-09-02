import { Request, Response } from 'express';

import { createUser } from '../services/UserService';

class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    await createUser(email, password);

    return response.sendStatus(204);
  }
}

export default UsersController;
