import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreatePostSchema, CreatePostSchemaResponse, ResponseErrorSchema } from '../../models';
import { RequestWithBody } from '../../types/request-types';
import { createPostService } from '../../services/create-post-service';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = CreatePostSchemaResponse | ResponseErrorSchema;

export const createPostController = async (req: RequestWithBody<CreatePostSchema>, res: Response<ResponseType>) => {
  try {
    const { data: blog, status } = await queryRepository.getBlogById(req.body.blogId);

    if (status === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const { data: postIdObj, status: postStatus } = await createPostService(req.body, blog!);

    if (postStatus === ResultStatus.Success) {
      const { data, status } = await queryRepository.getPostById(postIdObj!.toString());

      if (status === ResultStatus.Success) {
        res.status(HTTP_STATUSES.CREATED_201).json(data!);
      }

      if (status === ResultStatus.NotFound) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }
    }

    if (postStatus === ResultStatus.NotFound) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
