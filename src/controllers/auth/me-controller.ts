import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { AuthUserInfoSchemaResponse } from '../../Veiw';
import { RequestEmpty } from '../../types/request-types';

export const meController = async (req: RequestEmpty, res: Response<AuthUserInfoSchemaResponse>) => {
  try {
    const user: AuthUserInfoSchemaResponse = {
      email: res.locals.user!.email,
      login: res.locals.user!.login,
      userId: res.locals.user!.id,
    };

    res.status(HTTP_STATUSES.OK_200).json(user);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
