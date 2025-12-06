import factory from 'factory-girl';
import { faker } from '@faker-js/faker';
import { User } from '../../src/models/User';

factory.define('User', User, {
  email: faker.internet.email,
  password: faker.internet.password,
});

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
  const name = faker.string.alphanumeric(4).toLowerCase();

  return {
    id: faker.number.int(),
    name,
    full_name: `${faker.internet.username()}/${name}`.toLowerCase(),
  };
});

export default factory;
