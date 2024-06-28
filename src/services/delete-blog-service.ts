import { mongoDBRepository } from '../repositories/db-repository';
import { BlogDbType } from '../types/blog-types';
import { blogsCollection } from '../db/collection';
import { ResultStatus } from '../types/common/result';

export const deleteBlogService = async (id: string) => {
  const updateResult = await mongoDBRepository.delete<BlogDbType>(blogsCollection, id);

  if (updateResult.deletedCount === 1) {
    return { data: null, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
