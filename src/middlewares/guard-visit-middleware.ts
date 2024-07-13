import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../utils/consts';
import { ResultStatus } from '../types/common/result';
import { visitService } from '../compositions/composition-root';

export const guardVisitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = await visitService.calculateVisit(req.ip!, req.originalUrl);

  if (status === ResultStatus.Success) {
    next();
  } else {
    res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
    return;
  }
};
