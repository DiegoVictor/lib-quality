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

export default UsersRepository;
