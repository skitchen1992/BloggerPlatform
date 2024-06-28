import { Response } from 'express';
import { GetPostListSchema } from '../../models';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithQuery } from '../../types/request-types';
import { GetPostsQuery } from '../../types/post-types';
import { queryRepository } from '../../repositories/queryRepository';

export const getPostsController = async (req: RequestWithQuery<GetPostsQuery>, res: Response<GetPostListSchema>) => {
  try {
    const { data } = await queryRepository.getPosts(req.query);

    res.status(HTTP_STATUSES.OK_200).json(data);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
