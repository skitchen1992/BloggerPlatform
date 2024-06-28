import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../utils/consts';
import { addVisitRecordService } from '../services/add-visit-record-service';
import { ResultStatus } from '../types/common/result';

export const guardVisitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = await addVisitRecordService(req.ip!, req.originalUrl);

  if (status === ResultStatus.Success) {
    next();
  } else {
    res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
    return;
  }
};
