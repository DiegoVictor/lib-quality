import Repository from '../models/Repository';
import SearchSession from '../models/SearchSession';

class StatisticsRepository {
  async trackSearch(
    fullName: string,
    user_id: string,
    session: string,
  ): Promise<void> {
    const repo = await Repository.findOneAndUpdate(
      { fullName },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    ).lean();

    await SearchSession.findOneAndUpdate(
      { user_id, session },
      {
        $push: {
          repositories: repo?._id,
        },
      },
      { upsert: true },
    );
  }
}

export default StatisticsRepository;
