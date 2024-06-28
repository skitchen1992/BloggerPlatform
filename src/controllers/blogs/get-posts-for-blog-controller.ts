import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetPostListSchema } from '../../models';
import { RequestWithQueryAndParams } from '../../types/request-types';
import { GetPostsQuery } from '../../types/post-types';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

export const getPostsForBlogController = async (
  req: RequestWithQueryAndParams<GetPostsQuery, { blogId: string }>,
  res: Response<GetPostListSchema>
) => {
  try {
    const { status } = await queryRepository.getBlogById(req.params.blogId);

    if (status !== ResultStatus.Success) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const { data } = await queryRepository.getPosts(req.query, req.params);

    res.status(HTTP_STATUSES.OK_200).json(data);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
