import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { CreateBlogSchema, CreateBlogSchemaResponse, ResponseErrorSchema } from '../../Veiw';
import { RequestWithBody } from '../../types/request-types';
import { createBlogService } from '../../services/create-blog-service';
import { queryRepository } from '../../repositories/queryRepository';
import { ResultStatus } from '../../types/common/result';

type ResponseType = CreateBlogSchemaResponse | ResponseErrorSchema;

export const createBlogController = async (req: RequestWithBody<CreateBlogSchema>, res: Response<ResponseType>) => {
  try {
    const insertedId = await createBlogService(req.body);

    const { data, status } = await queryRepository.getBlogById(insertedId.toString());

    if (status === ResultStatus.Success) {
      res.status(HTTP_STATUSES.CREATED_201).json(data!);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
