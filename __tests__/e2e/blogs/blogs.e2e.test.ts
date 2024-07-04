import { createAuthorizationHeader } from '../../test-helpers';
import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import * as data from './datasets';
import { SETTINGS } from '../../../src/utils/settings';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { agent, Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { app } from '../../../src/app';
import { ID } from './datasets';
import { getCurrentDate } from '../../../src/utils/dates/dates';
import { db } from '../../../src';
import { BlogModel } from '../../../src/models/blog';
import { testSeeder } from '../../test.seeder';
import { BlogMapper } from '../../../src/mappers/blog-mapper';
import { ObjectId } from 'mongodb';
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

afterEach(async () => {
  await db.dropDB();
  await mongoServer.stop();
});

describe(`Endpoint (GET) - ${PATH_URL.BLOGS}`, () => {
  it('Should get empty array', async () => {
    const res = await req.get(PATH_URL.BLOGS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(0);
    expect(1).toBe(1);
  });

  it('Should get not empty array', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const res = await req.get(PATH_URL.BLOGS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        BlogMapper.toBlogDTO(blogList[0]),
      ],
    });
  });

  it('Should get filtered array by searchNameTerm=Nikita', async () => {

    const id = new ObjectId();
    const createdAt = getCurrentDate();

    await BlogModel.insertMany([
      {
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        _id: id,
        createdAt,
        isMembership: false,
      },
      {
        name: 'Sacha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        _id: new ObjectId(),
        createdAt: getCurrentDate(),
        isMembership: false,
      },
      {
        name: 'Mascha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        _id: new ObjectId(),
        createdAt: getCurrentDate(),
        isMembership: false,
      },
    ]);

    const res = await req.get(`${PATH_URL.BLOGS}/?searchNameTerm=Nikita`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [BlogMapper.toBlogDTO({
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        _id: id,
        createdAt: createdAt,
        isMembership: false,
      })],
    });
  });

  it('Should get second page', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(3));

    const res = await req.get(`${PATH_URL.BLOGS}/?pageNumber=2&pageSize=2`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [BlogMapper.toBlogDTO(blogList[2])],
    });
  });
});

describe(`Endpoint (GET) - ${PATH_URL.POSTS_FOR_BLOG}`, () => {

  it('Should get filtered array', async () => {
    const blogList = await BlogModel.insertMany(testSeeder.createBlogListDto(3));

    const blogId = blogList[0]._id.toString();

    const postList = await PostModel.insertMany(testSeeder.createPostListDto(3, blogId));

    const res = await req.get(`${PATH_URL.BLOGS}/${blogId}/posts`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(3);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: postList.map((post) => (PostMapper.toPostDTO(post))),
    });
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req.get(`${PATH_URL.BLOGS}/${ID}/posts`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (GET) by ID - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {

  it('Should get blog', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(3));

    const blogId = result[0]._id.toString();

    const res = await req.get(`${PATH_URL.BLOGS}/${blogId}`).expect(HTTP_STATUSES.OK_200);
    const blog = result.find(blog => (blog._id.toString() === blogId));

    expect(res.body).toEqual(
      //@ts-ignore
      BlogMapper.toBlogDTO(blog),
    );
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await BlogModel.insertMany(testSeeder.createBlogListDto(3));

    await req.get(`${PATH_URL.BLOGS}/${ID}`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.BLOGS}`, () => {
  it('Should add blog', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        name: 'Test',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body).toEqual(
      expect.objectContaining({
        name: 'Test',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      }),
    );

    const blog = await BlogModel.findById(res.body.id);

    expect(blog).toEqual(
      expect.objectContaining({
        name: 'Test',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      }),
    );
  });

  it('Should get Error while field "name" is too long', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog1)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "name" is not a string', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog2)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "name" is empty', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog3)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "description" is too long', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog4)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "description" is not a string', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog5)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog6)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "websiteUrl" is not correct', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog7)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet7);
  });

  it.skip('Should get Error while we add too many fields specified', async () => {
    const res = await req
      .post(PATH_URL.BLOGS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog8)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet8);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.POSTS_FOR_BLOG}`, () => {
  it('Should add post for blog', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .post(`${PATH_URL.BLOGS}/${blogId}/posts`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body).toEqual(
      expect.objectContaining({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
        blogId,
      }),
    );

    const post = await PostModel.findById(res.body.id);

    const { title, shortDescription, content, blogId: blogID, blogName } = post!;

    expect({ title, shortDescription, content, blogId, blogName }).toEqual(
      expect.objectContaining({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
        blogId: blogId,
        blogName: 'Test0',
      }),
    );
  });
});

describe(`Endpoint (PUT) - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {
  it('Should update blog', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetUpdateBlog)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const blog = await BlogModel.findById(blogId);

    expect(blog).toEqual(
      expect.objectContaining({
        name: 'New test',
        description: 'New Test description',
        websiteUrl: 'https://string.ru',
      }),
    );
  });

  it(`Should get error ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req
      .put(`${PATH_URL.BLOGS}/${ID}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetUpdateBlog)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('Should get Error while field "name" is too long', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog1)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "name" is not a string', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog2)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "name" is empty', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog3)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "description" is too long', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog4)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "description" is not a string', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog5)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog6)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "websiteUrl" is not correct', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog7)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet7);
  });
  //skip for tests
  it.skip('Should get Error while we add too many fields specified', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    const res = await req
      .put(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog8)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet8);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {
  it('Should delete blog', async () => {
    const result = await BlogModel.insertMany(testSeeder.createBlogListDto(1));

    const blogId = result[0]._id.toString();

    await req
      .delete(`${PATH_URL.BLOGS}/${blogId}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get error ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req
      .delete(`${PATH_URL.BLOGS}/${ID}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});
