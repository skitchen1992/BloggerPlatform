import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreatePostSchemaResponse, ResponseErrorSchema } from '../../Veiw';
import { RequestWithParamsAndBody } from '../../types/request-types';
import { CreatePostForBlogSchema } from '../../Veiw/posts/CreatePostForBlogSchema';
import { createPostForBlogService } from '../../services/create-post-for-blog-service';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = CreatePostSchemaResponse | ResponseErrorSchema;

export const createPostForBlogController = async (
  req: RequestWithParamsAndBody<CreatePostForBlogSchema, { blogId: string }>,
  res: Response<ResponseType>
) => {
  try {
    const { data: postIdObj, status: blogStatus } = await createPostForBlogService(req.body, req.params);

    if (blogStatus === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const { data: post, status: postStatus } = await queryRepository.getPostById(postIdObj!.toString());

    if (postStatus === ResultStatus.Success) {
      res.status(HTTP_STATUSES.CREATED_201).json(post!);
    }

    if (postStatus === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    return;
  }
};
