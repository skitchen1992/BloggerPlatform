import { Response } from 'express';
import { GetCommentListSchema } from '../../Veiw';
import { HTTP_STATUSES } from '../../utils/consts';
import { RequestWithQueryAndParams } from '../../types/request-types';
import { GetPostsQuery } from '../../types/post-types';
import { queryRepository } from '../../repositories/queryRepository';

export const getCommentsForPostController = async (
  req: RequestWithQueryAndParams<GetPostsQuery, { postId: string }>,
  res: Response<GetCommentListSchema>
) => {
  try {
    const { data: comments } = await queryRepository.getComments(req.query, { postId: req.params.postId });

    res.status(HTTP_STATUSES.OK_200).json(comments);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
