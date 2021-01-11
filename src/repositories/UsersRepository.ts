import bcryptjs from 'bcryptjs';

import Model, { User } from '../models/User';

interface UserWithId extends User {
  _id: string;
}

class UsersRepository {
  async create(email: string, password: string): Promise<User> {
    const user = await Model.create({
      email,
      password: await bcryptjs.hash(password, 8),
    });
    return user;
  }

  async findOneByEmail(email: string): Promise<UserWithId | null> {
    const user: UserWithId | null = await Model.findOne({ email }).lean();
    return user;
  }

  async comparePassword(
    password: string,
    savedPassword: string,
  ): Promise<boolean> {
    const isOk = await bcryptjs.compare(password, savedPassword);

    return isOk;
  }
}

export default UsersRepository;
