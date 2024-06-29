import { CreateCommentSchema, GetUserView } from '../Veiw';
import { mongoDBRepository } from '../repositories/db-repository';
import { commentsCollection } from '../db/collection';
import { CommentDbType } from '../types/comments-types';
import { ResultStatus } from '../types/common/result';
import { getCurrentDate } from '../utils/dates/dates';

export const createCommentService = async (
  body: CreateCommentSchema,
  params: { postId: string },
  user: GetUserView
) => {
  const newComment: CommentDbType = {
    content: body.content,
    commentatorInfo: {
      userId: user.id,
      userLogin: user.login,
    },
    postId: params.postId,
    createdAt: getCurrentDate(),
  };

  const { insertedId, acknowledged } = await mongoDBRepository.add<CommentDbType>(commentsCollection, newComment);

  if (acknowledged) {
    return { data: insertedId, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
