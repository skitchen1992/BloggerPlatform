import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { jwtService, userRepository } from '../compositions/composition-root';

export const bearerTokenUserInterceptorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.indexOf('Bearer ') !== -1) {
    const [_, token] = authHeader.split(' ');

    const { userId } = (jwtService.verifyToken(token) as JwtPayload) ?? {};

    const { data: user } = await userRepository.getUserById(userId);

    if (user) {
      res.locals.user = user;
      next();
    } else {
      res.locals.user = undefined;
      next();
    }
  } else {
    res.locals.user = undefined;
    next();
  }
};
