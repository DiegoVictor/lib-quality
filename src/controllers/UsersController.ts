import { Request, Response } from 'express';

import UsersRepository from '../repositories/UsersRepository';

const usersRepository = new UsersRepository();

class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const user = await usersRepository.findOneByEmail(email);

    if (user) {
      return response.status(400).json({
        message: 'Email already in use',
      });
    }

    await usersRepository.create(email, password);

    return response.sendStatus(204);
  }
}

export default UsersController;
