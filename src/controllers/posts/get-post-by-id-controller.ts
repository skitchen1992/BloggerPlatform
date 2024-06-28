import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetPostSchema, ResponseErrorSchema } from '../../Veiw';
import { RequestWithParams } from '../../types/request-types';
import { mongoDBRepository } from '../../repositories/db-repository';
import { postsCollection } from '../../db/collection';
import { PostDbType } from '../../types/post-types';
import { mapIdField } from '../../utils/map';

type ResponseType = GetPostSchema | ResponseErrorSchema;

export const getPostByIdController = async (req: RequestWithParams<{ id: string }>, res: Response<ResponseType>) => {
  try {
    const post = await mongoDBRepository.getById<PostDbType>(postsCollection, req.params.id);

    if (post) {
      const mapBlogs = mapIdField<GetPostSchema>(post);

      res.status(HTTP_STATUSES.OK_200).json(mapBlogs);
    } else {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  } catch (e) {
    console.log(e);
  }
};
