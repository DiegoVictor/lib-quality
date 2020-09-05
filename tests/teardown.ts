module.exports = async () => {
  await (global as any).__MONGOD__.stop();
};
