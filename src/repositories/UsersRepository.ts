import bcryptjs from 'bcryptjs';
import { Document } from 'mongoose';

import User from '../models/User';

interface User {
  _id: string;
  email: string;
  password: string;
}

class UsersRepository {
  async create(email: string, password: string): Promise<Document> {
    const user = await User.create({
      email,
      password: await bcryptjs.hash(password, 8),
    });
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user: User | null = await User.findOne({ email }).lean();
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
