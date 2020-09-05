import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer({
  instance: {
    ip: '127.0.0.1',
    dbName: 'jest',
    port: 27018,
  },
  autoStart: false,
});

module.exports = async () => {
  await mongod.getConnectionString();

  process.env.MONGO_HOST = '127.0.0.1';
  process.env.MONGO_PORT = '27018';
  process.env.MONGO_DB = 'jest';

  (global as any).__MONGOD__ = mongod;
};
