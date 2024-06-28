import { CreatePostSchema, GetBlogSchema } from '../models';
import { mongoDBRepository } from '../repositories/db-repository';
import { postsCollection } from '../db/collection';
import { PostDbType } from '../types/post-types';
import { ResultStatus } from '../types/common/result';
import { getCurrentDate } from '../utils/dates/dates';

export const createPostService = async (body: CreatePostSchema, blog: GetBlogSchema) => {
  const newPost: PostDbType = {
    title: body.title,
    shortDescription: body.shortDescription,
    content: body.content,
    blogName: blog.name,
    blogId: blog.id,
    createdAt: getCurrentDate(),
  };

  const { insertedId, acknowledged } = await mongoDBRepository.add<PostDbType>(postsCollection, newPost);

  if (acknowledged) {
    return { data: insertedId, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
