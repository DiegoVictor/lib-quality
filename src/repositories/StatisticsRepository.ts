import { SearchSession } from '../models/SearchSession';
import RepositoriesRepository from './RepositoriesRepository';

const repositoriesRepository = new RepositoriesRepository();

class StatisticsRepository {
  async trackSearch(
    fullName: string,
    user_id: string,
    session: string,
  ): Promise<void> {
    const repo = await repositoriesRepository.findOneByFullName(fullName);

    let _id;
    if (repo) {
      repo.count += 1;
      await repo.save();
      _id = repo._id;
    } else {
      const newRepo = await repositoriesRepository.create(fullName);
      _id = newRepo._id;
    }

    await SearchSession.findOneAndUpdate(
      { user_id, session },
      {
        $push: {
          repositories: _id,
        },
      },
      { upsert: true },
    );
  }
}

export default StatisticsRepository;
