import { createAuthorizationHeader, createBearerAuthorizationHeader } from '../../test-helpers';
import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import * as data from './datasets';
import { SETTINGS } from '../../../src/utils/settings';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { blogsCollection, commentsCollection, connectToDb, postsCollection } from '../../../src/db/collection';
import { app } from '../../../src/app';
import TestAgent from 'supertest/lib/agent';
import { mongoDBRepository } from '../../../src/repositories/db-repository';
import { BlogDbType } from '../../../src/types/blog-types';
import { PostDbType } from '../../../src/types/post-types';
import { ID } from './datasets';
import { after } from 'node:test';
import { getCurrentDate } from '../../../src/utils/dates/dates';
import { db } from '../../../src';
import { BlogModel } from '../../../src/models/blog';
import { testSeeder } from '../../test.seeder';
import { PostModel } from '../../../src/models/post';
import { PostMapper } from '../../../src/mappers/post-mapper';

let req: TestAgent<Test>;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (!db.isConnected()) {
    await db.connect(uri);
  }

  req = agent(app);
});

beforeEach(async () => {
  await db.cleanDB();
});

afterAll(async () => {
  await db.dropDB();
  await mongoServer.stop();
  await db.disconnect();
});

describe(`Endpoint (GET) - ${PATH_URL.POSTS}`, () => {
  it('Should get empty array', async () => {
    const res = await req.get(PATH_URL.POSTS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(0);
  });

  it('Should get not empty array', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));

    const res = await req.get(PATH_URL.POSTS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: postList.map((post) => (PostMapper.toPostDTO(post))),
    });
  });

  it('Should get second page', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(3, blogId));

    const res = await req.get(`${PATH_URL.POSTS}/?pageNumber=2&pageSize=2`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [PostMapper.toPostDTO(postList[2])],
    });
  });
});

describe(`Endpoint (GET) by ID - ${PATH_URL.POSTS}${PATH_URL.ID}`, () => {
  it('Should get a post', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req.get(`${PATH_URL.POSTS}/${postId}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual(PostMapper.toPostDTO(postList[0]));
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));

    await req.get(`${PATH_URL.POSTS}/${ID}`).expect(HTTP_STATUSES.NOT_FOUND_404);

  });
});

describe(`Endpoint (POST) - ${PATH_URL.POSTS}`, () => {
  it('Should add post', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();
    const blogName = blogList[0].name;

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost0, blogId })
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body).toEqual(
      expect.objectContaining({ ...data.dataSetNewPost0, blogId, blogName }),
    );
  });

  it('Should get error while blog not found', async () => {
    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost0, blogId: ID })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Blog is not founded',
          field: 'blogId',
        },
      ],
    });
  });

  it('Should get Error while field "title" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost1, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "title" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost2, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "title" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost3, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "shortDescription" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost4, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "shortDescription" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost5, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost6, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "content" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost7, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet7);
  });

  it('Should get Error while field "content" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost8, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet8);
  });

  it('Should get Error while field "content" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost9, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet9);
  });

  //skip for tests
  it.skip('Should get Error while we add too many fields specified', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const res = await req
      .post(PATH_URL.POSTS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost10, blogId: blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet10);
  });
});

describe(`Endpoint (PUT) - ${PATH_URL.POSTS}${PATH_URL.ID}`, () => {
  it('Should update post', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();
    const blogName = postList[0].blogName;

    await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetUpdatePost, blogId })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const post = await PostModel.findById(postId);

    expect(post).toEqual(
      expect.objectContaining({ ...data.dataSetUpdatePost, blogId, blogName }),
    );
  });

  it('Should get Error while field "title" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();


    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost1, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "title" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost2, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "title" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost3, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "shortDescription" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost4, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "shortDescription" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();
    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost5, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost6, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "content" is too long', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost7, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet7);
  });

  it('Should get Error while field "content" is not a string', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost8, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet8);
  });

  it('Should get Error while field "content" is empty', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost9, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet9);
  });

  it('Should get Error while we add too many fields specified', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({ ...data.dataSetNewPost10, blogId })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet10);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.POSTS}${PATH_URL.ID}`, () => {
  it('Should delete post', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .delete(`${PATH_URL.POSTS}/${postId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const post = await PostModel.findById(postId);

    expect(post).toBe(null);
  });

  it(`Should get error ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .delete(`${PATH_URL.POSTS}/${ID}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const post = await PostModel.findById(postId);
    expect(Boolean(post)).toBe(true);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.COMMENT_FOR_POST}`, () => {
  it('Should get created comment', async () => {
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

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    const res = await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body).toEqual(
      expect.objectContaining({
        content: 'content content content',
        commentatorInfo: expect.objectContaining({ userLogin: login }),
      }),
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

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .post(`${PATH_URL.POSTS}/${postId}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'c',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
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

    await req.post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`).send({
      loginOrEmail: login,
      password,
    });

    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));
    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(1, blogId));
    const postId = postList[0]._id.toString();

    await req
      .post(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .send({
        content: 'c',
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

    await req
      .post(`${PATH_URL.POSTS}/${ID}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (GET) - ${PATH_URL.COMMENT_FOR_POST}`, () => {
  let req: TestAgent<Test>;
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectToDb(mongoServer.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
    await commentsCollection.deleteMany();
  });

  afterEach(async () => {
    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
    await commentsCollection.deleteMany();
  });

  after(async () => {
    await mongoServer.stop();
  });

  it('Should get empty array comment', async () => {
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

    const res = await req
      .get(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('Should get not empty array comment', async () => {
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

    const res = await req
      .get(`${PATH_URL.POSTS}/${postId.toString()}${PATH_URL.COMMENTS}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        expect.objectContaining({
          content: 'content content content',
          commentatorInfo: expect.objectContaining({ userLogin: login }),
        }),
      ],
    });
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

    await req.get(`${PATH_URL.POSTS}/${ID}${PATH_URL.COMMENTS}`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});
