import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Request, Response, NextFunction } from 'express';
import { badRequest, unauthorized } from '@hapi/boom';

import auth from '../config/auth';

interface Token {
  iat: number;
  exp: number;
  id: string;
  session: string;
}

export default async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const { authorization } = request.headers;

  if (!authorization) {
    throw badRequest('Missing authorization token');
  }

  try {
    const [, token] = authorization.split(' ');
    const decoded = await promisify(jwt.verify)(token, auth.secret);
    const { id, session } = decoded as Token;

    request.user = { id, session };

    return next();
  } catch (err) {
    throw unauthorized('Token expired or invalid');
  }
};
