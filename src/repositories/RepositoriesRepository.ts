import Model, { Repository } from '../models/Repository';

class RepositoriesRepository {
  async create(fullName: string, count = 1): Promise<Repository> {
    const repository = await Model.create({
      fullName,
      count,
    });
    return repository;
  }

  async findOneByFullName(fullName: string): Promise<Repository | null> {
    const repository = await Model.findOne({
      fullName,
    });
    return repository;
  }
}

export default RepositoriesRepository;
