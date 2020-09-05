import factory from 'factory-girl';
import faker from 'faker';

factory.define(
  'User',
  {},
  {
    email: faker.internet.email,
    password: faker.internet.password,
  },
);

factory.define(
  'Issue',
  {},
  {
    created_at: faker.date.past,
    closed_at: faker.date.past,
    pull_request: {
      url: faker.internet.url,
    },
  },
);

factory.define('GithubRepository', {}, () => {
  const name = faker.random.alphaNumeric(4);

  return {
    id: faker.random.number(),
    name,
    full_name: `${faker.internet.userName()}/${name}`,
  };
});

export default factory;
