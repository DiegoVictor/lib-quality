import jwt from 'jsonwebtoken';

import auth from '../../src/config/auth';

export default (id: string): string => {
  return jwt.sign({ id }, auth.secret, {
    expiresIn: auth.expirationTime,
  });
};
