import { Request, Response } from 'express';

import { createUser } from '../services/UserService';

class UsersController {
  async store(request: Request, response: Response): Promise<void> {
    const { email, password } = request.body;

    await createUser(email, password);

    response.sendStatus(204);
  }
}

export default UsersController;
