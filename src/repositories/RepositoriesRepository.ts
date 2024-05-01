import { IRepository, Repository } from '../models/Repository';

class RepositoriesRepository {
  async create(fullName: string, count = 1): Promise<IRepository> {
    const repository = await Repository.create({
      full_name: fullName,
      count,
    });
    return repository;
  }

  async findOneByFullName(fullName: string): Promise<IRepository | null> {
    const repository = await Repository.findOne({
      full_name: fullName,
    });
    return repository;
  }
}

export default RepositoriesRepository;
