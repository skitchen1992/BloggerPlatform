import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../utils/consts';
import { jwtService } from '../services/jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { userRepository } from '../repositories/user-repository';

export const bearerTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.indexOf('Bearer ') === -1) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const [_, token] = authHeader.split(' ');

  const { userId } = (jwtService.verifyToken(token) as JwtPayload) ?? {};

  if (!userId) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const { data: user } = await userRepository.getUserById(userId);

  if (user) {
    res.locals.user = user;
    next();
  } else {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
};
