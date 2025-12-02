import bcryptjs from 'bcryptjs';
import { User, IUser } from '../models/User';

class UsersRepository {
  async create(email: string, password: string): Promise<IUser> {
    const user = await User.create({
      email,
      password: await bcryptjs.hash(password, 8),
    });
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await User.findOne({ email }).lean();
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
