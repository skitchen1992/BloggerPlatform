import { mongoDBRepository } from '../repositories/db-repository';
import { BlogDbType } from '../types/blog-types';
import { blogsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';
import { UpdateBlogSchema } from '../models';

export const updateBlogService = async (id: string, data: UpdateBlogSchema) => {
  const updateResult = await mongoDBRepository.update<BlogDbType>(blogsCollection, id, data);

  if (updateResult.modifiedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
