import { createAuthorizationHeader, createBearerAuthorizationHeader } from '../../test-helpers';
import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import * as data from './datasets';
import { SETTINGS } from '../../../src/utils/settings';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { agent, Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { app } from '../../../src/app';
import { blogsCollection, commentsCollection, connectToDb, postsCollection } from '../../../src/db/collection';
import { BlogDbType } from '../../../src/types/blog-types';
import { PostDbType } from '../../../src/types/post-types';
import { mongoDBRepository } from '../../../src/repositories/db-repository';
import { CommentDbType } from '../../../src/types/comments-types';
import { ID } from './datasets';
import { getCurrentDate } from '../../../src/utils/dates/dates';

describe(`Endpoint (GET) - ${PATH_URL.COMMENTS}`, () => {
  let req: TestAgent<Test>;

  beforeEach(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
    await commentsCollection.deleteMany();
  });

  it('Should get comment', async () => {
    const createdAt = getCurrentDate();

    const newComment: CommentDbType = {
      content: 'Content Content Content',
      commentatorInfo: {
        userId: ID,
        userLogin: 'login',
      },
      postId: ID,
      createdAt,
    };

    const { insertedId } = await mongoDBRepository.add<CommentDbType>(commentsCollection, newComment);

    const res = await req.get(`${PATH_URL.COMMENTS}/${insertedId.toString()}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      id: insertedId.toString(),
      content: 'Content Content Content',
      commentatorInfo: {
        userId: ID,
        userLogin: 'login',
      },
      createdAt,
    });
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req.get(`${PATH_URL.COMMENTS}/${ID}`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (PUT) - ${PATH_URL.COMMENTS}`, () => {
  let req: TestAgent<Test>;

  beforeEach(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
    await commentsCollection.deleteMany();
  });

  it('Should update comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const res = await req.get(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual(
      expect.objectContaining({
        content: 'content content content content',
      })
    );
  });

  it(`Should get ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const res = await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Max length 20, min length 300',
        },
      ],
    });
  });

  it(`Should get ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`Should get ${HTTP_STATUSES.FORBIDDEN_403}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const token2 = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login2,
      password: password2,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.COMMENTS}`, () => {
  let req: TestAgent<Test>;

  beforeEach(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
    await commentsCollection.deleteMany();
  });

  it('Should delete comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .put(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await req
      .delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req.delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .delete(`${PATH_URL.COMMENTS}/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`Should get ${HTTP_STATUSES.FORBIDDEN_403}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const token = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const token2 = await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login2,
      password: password2,
    });

    const insertOneResultBlog = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: blogId } = insertOneResultBlog;

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, blogId.toString());

    const createdAt = getCurrentDate();

    const insertOneResultPost = await mongoDBRepository.add<PostDbType>(postsCollection, {
      ...data.dataSetNewPost,
      blogId: blogId.toString(),
      blogName: blog!.name,
      createdAt,
    });

    const { insertedId: postId } = insertOneResultPost;

    const comment = await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .delete(`${PATH_URL.COMMENTS}/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });
});
