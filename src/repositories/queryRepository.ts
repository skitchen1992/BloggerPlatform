import { getPageCount, searchQueryBuilder } from '../utils/helpers';
import { BlogDbType, GetBlogsQuery } from '../types/blog-types';
import {
  GetBlogListView,
  GetBlogSchema,
  GetCommentListSchema, GetCommentSchema,
  GetDeviceSchema,
  GetPostListView,
  GetPostVeiw,
  GetUserListView,
  GetUserView,
} from '../view';
import {
  blogsCollection,
  commentsCollection,
  deviceAuthSessionsCollection,
  documentsCollection,
  postsCollection,
  usersCollection,
} from '../db/collection';
import { mapperRepository } from './mapperRepository';
import { Result, ResultStatus } from '../types/common/result';
import { GetPostsQuery, PostDbType } from '../types/post-types';
import { CommentDbType, GetCommentsQuery } from '../types/comments-types';
import { EmailConfirmationWithId, GetUsersQuery, IUserByEmail, UserDbType } from '../types/users-types';
import { mongoDBRepository } from './db-repository';
import { DeviceAuthSessionDbType } from '../types/device-auth-session-types';
import { getCurrentDate } from '../utils/dates/dates';


class QueryRepository {
  public async getBlogById(id: string) {
    const blog = await mapperRepository.getEntityAndMapIdField<BlogDbType, GetBlogSchema>(blogsCollection, id);

    return { data: blog, status: blog ? ResultStatus.Success : ResultStatus.NotFound };
  }

  public async getBlogs(query: GetBlogsQuery): Promise<Result<GetBlogListView>> {
    const filters = searchQueryBuilder.getBlogs(query);

    const { entities: blogList, totalCount } = await mapperRepository.getEntitiesAndMapIdFieldInArray<
      BlogDbType,
      GetBlogSchema
    >(blogsCollection, filters);

    const blogs: GetBlogListView = {
      pagesCount: getPageCount(totalCount, filters.pageSize),
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      items: blogList,
    };

    return { data: blogs, status: ResultStatus.Success };
  }

  public async getPostById(id: string) {
    const post = await mapperRepository.getEntityAndMapIdField<PostDbType, GetPostVeiw>(postsCollection, id);
    return { data: post, status: post ? ResultStatus.Success : ResultStatus.NotFound };
  }

  public async getPosts(query: GetPostsQuery, params?: { blogId: string }) {
    const filters = searchQueryBuilder.getPosts(query, params);

    const { entities: postList, totalCount } = await mapperRepository.getEntitiesAndMapIdFieldInArray<
      PostDbType,
      GetPostVeiw
    >(postsCollection, filters);

    const posts: GetPostListView = {
      pagesCount: getPageCount(totalCount, filters.pageSize),
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      items: postList,
    };

    return { data: posts, status: ResultStatus.Success };
  }

  public async getCommentById(id: string, fieldsToRemove: string[] = ['postId']) {
    const comment = await mapperRepository.getEntityAndMapIdField<CommentDbType, GetCommentSchema>(
      commentsCollection,
      id,
      fieldsToRemove
    );
    return { data: comment, status: comment ? ResultStatus.Success : ResultStatus.NotFound };
  }

  public async getComments(
    query: GetCommentsQuery,
    params?: { postId: string },
    fieldsToRemove: string[] = ['postId']
  ) {
    const filters = searchQueryBuilder.getComments(query, params);

    const { entities: commentList, totalCount } = await mapperRepository.getEntitiesAndMapIdFieldInArray<
      CommentDbType,
      GetCommentSchema
    >(commentsCollection, filters, fieldsToRemove);

    const comments: GetCommentListSchema = {
      pagesCount: getPageCount(totalCount, filters.pageSize),
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      items: commentList,
    };

    return { data: comments, status: ResultStatus.Success };
  }

  public async getUserById(id: string, fieldsToRemove: string[] = ['password', 'emailConfirmation']) {
    const user = await mapperRepository.getEntityAndMapIdField<UserDbType, GetUserView>(
      usersCollection,
      id,
      fieldsToRemove
    );
    return { data: user, status: user ? ResultStatus.Success : ResultStatus.NotFound };
  }

  public async getUserByEmail(email: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(usersCollection, ['email'], email);

    if (user && user.emailConfirmation) {
      const data: IUserByEmail = {
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: user.emailConfirmation.expirationDate,
        isConfirmed: user.emailConfirmation.isConfirmed,
        email: user.email,
        id: user._id.toString(),
      };
      return { data: data, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUserByFields(fields: string[], input: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(usersCollection, fields, input);

    if (user) {
      return { data: user, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUserByConfirmationCode(code: string) {
    const user = await mongoDBRepository.getByField<UserDbType>(
      usersCollection,
      ['emailConfirmation.confirmationCode'],
      code
    );

    if (user?.emailConfirmation) {
      const data: EmailConfirmationWithId = {
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: user.emailConfirmation.expirationDate,
        isConfirmed: user.emailConfirmation.isConfirmed,
        id: user._id.toString(),
      };
      return { data: data, status: ResultStatus.Success };
    } else {
      return { data: null, status: ResultStatus.NotFound };
    }
  }

  public async getUsers(query: GetUsersQuery, fieldsToRemove: string[] = ['password', 'emailConfirmation']) {
    const filters = searchQueryBuilder.getUsers(query);

    const { entities: userList, totalCount } = await mapperRepository.getEntitiesAndMapIdFieldInArray<
      UserDbType,
      GetUserView
    >(usersCollection, filters, fieldsToRemove);

    const users: GetUserListView = {
      pagesCount: getPageCount(totalCount, filters.pageSize),
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      items: userList,
    };

    return { data: users, status: ResultStatus.Success };
  }

  public async getUserConfirmationData(id: string) {
    const user = await mongoDBRepository.getById<UserDbType>(usersCollection, id);

    return {
      data: user?.emailConfirmation,
      status: user?.emailConfirmation ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getDeviceAuthSession(deviceId: string) {
    const deviceAuthSession = await mongoDBRepository.getByField<DeviceAuthSessionDbType>(
      deviceAuthSessionsCollection,
      ['deviceId'],
      deviceId
    );
    return {
      data: deviceAuthSession,
      status: deviceAuthSession ? ResultStatus.Success : ResultStatus.NotFound,
    };
  }

  public async getDeviceList(userId: string) {
    const filters = { userId, tokenExpirationDate: { $gt: getCurrentDate() } };

    const data = await mapperRepository.findEntityList<DeviceAuthSessionDbType, GetDeviceSchema>(
      deviceAuthSessionsCollection,
      filters,
      ['userId', 'tokenIssueDate', 'tokenExpirationDate', 'id']
    );

    return { data, status: ResultStatus.Success };
  }

  public async isExistsUser(login: string, email: string) {
    const hasUserByLogin = await mongoDBRepository.getByField<UserDbType>(usersCollection, ['login'], login);
    const hasUserByEmail = await mongoDBRepository.getByField<UserDbType>(usersCollection, ['email'], email);

    if (hasUserByLogin || hasUserByEmail) {
      return {
        data: hasUserByLogin ? 'login' : 'email',
        status: ResultStatus.BadRequest,
      };
    } else {
      return {
        data: null,
        status: ResultStatus.Success,
      };
    }
  }

  public async getDocumentsCount(ip: string, url: string, date: string) {
    const filters = {
      ip,
      url,
      date: { $gte: date },
    };

    return await mongoDBRepository.getTotalCount(documentsCollection, filters);
  }
}

export const queryRepository = new QueryRepository();
