import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetUserListSchema } from '../../models';
import { RequestWithQuery } from '../../types/request-types';
import { GetUsersQuery } from '../../types/users-types';
import { queryRepository } from '../../repositories/queryRepository';

export const getUsersController = async (req: RequestWithQuery<GetUsersQuery>, res: Response<GetUserListSchema>) => {
  try {
    const { data: users } = await queryRepository.getUsers(req.query);

    res.status(HTTP_STATUSES.OK_200).json(users);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
