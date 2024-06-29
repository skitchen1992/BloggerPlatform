import { Response } from 'express';
import { COOKIE_KEY, HTTP_STATUSES } from '../../utils/consts';
import { AuthUserSchemaResponse, ResponseErrorSchema } from '../../view';
import { RequestEmpty } from '../../types/request-types';
import { jwtService } from '../../services/jwt-service';
import { JwtPayload } from 'jsonwebtoken';
import { ResultStatus } from '../../types/common/result';
import { logoutService } from '../../services/logout-service';

export const logoutTokenController = async (
  req: RequestEmpty,
  res: Response<ResponseErrorSchema | AuthUserSchemaResponse>
) => {
  try {
    const refreshToken = req.getCookie(COOKIE_KEY.REFRESH_TOKEN);

    if (!refreshToken) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { userId } = (jwtService.verifyToken(refreshToken) as JwtPayload) ?? {};

    if (!userId) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
      return;
    }

    const { status } = await logoutService(refreshToken);

    if (status === ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
  } catch (e) {
    console.log(e);
  }
};
