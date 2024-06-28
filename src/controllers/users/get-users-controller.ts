import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetUserListView } from '../../Veiw';
import { RequestWithQuery } from '../../types/request-types';
import { GetUsersQuery } from '../../types/users-types';
import { userRepository } from '../../repositories/user-repository';

export const getUsersController = async (req: RequestWithQuery<GetUsersQuery>, res: Response<GetUserListView>) => {
  try {
    const { data } = await userRepository.getUsers(req.query);

    res.status(HTTP_STATUSES.OK_200).json(data);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
