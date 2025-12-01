import { SignOptions } from 'jsonwebtoken';

interface Auth {
  secret: string;
  expirationTime: SignOptions['expiresIn'];
}

export default {
  secret: process.env.JWT_SECRET,
  expirationTime: process.env.JWT_EXPIRATION_TIME,
} as Auth;
