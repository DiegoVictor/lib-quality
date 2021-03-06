import { MongoMemoryServer } from 'mongodb-memory-server';

module.exports = async () => {
  const mongod = new MongoMemoryServer();
  (global as any).__MONGOD__ = mongod;

  await mongod.start();

  const config = mongod.instanceInfo;
  if (config) {
    const { port, dbName } = config;

    process.env.MONGO_PORT = String(port);
    process.env.MONGO_DB = dbName;
  }
};
