import { CreateBlogSchema } from '../Veiw';
import { mongoDBRepository } from '../repositories/db-repository';
import { BlogDbType } from '../types/blog-types';
import { blogsCollection } from '../db/collection';

import { getCurrentDate } from '../utils/dates/dates';

export const createBlogService = async (body: CreateBlogSchema) => {
  const newBlog: BlogDbType = {
    name: body.name,
    description: body.description,
    websiteUrl: body.websiteUrl,
    createdAt: getCurrentDate(),
    isMembership: false,
  };

  const { insertedId } = await mongoDBRepository.add<BlogDbType>(blogsCollection, newBlog);

  return insertedId;
};
