import { mongoDBRepository } from '../repositories/db-repository';
import { postsCollection } from '../db/collection';
import { PostDbType } from '../types/post-types';
import { CreatePostForBlogSchema } from '../Veiw/posts/CreatePostForBlogSchema';
import { queryRepository } from '../repositories/queryRepository';
import { ResultStatus } from '../types/common/result';
import { getCurrentDate } from '../utils/dates/dates';

export const createPostForBlogService = async (body: CreatePostForBlogSchema, params: { blogId: string }) => {
  const { status, data } = await queryRepository.getBlogById(params.blogId);

  if (status === ResultStatus.NotFound) {
    return { data: null, status: ResultStatus.NotFound };
  }

  const newPost: PostDbType = {
    title: body.title,
    shortDescription: body.shortDescription,
    content: body.content,
    blogName: data!.name,
    blogId: data!.id,
    createdAt: getCurrentDate(),
  };

  const { insertedId, acknowledged } = await mongoDBRepository.add<PostDbType>(postsCollection, newPost);

  if (acknowledged) {
    return { data: insertedId, status: ResultStatus.Success };
  } else {
    return { data: null, status: ResultStatus.NotFound };
  }
};
