import { createAuthorizationHeader } from '../../test-helpers';
import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import * as data from './datasets';
import { SETTINGS } from '../../../src/utils/settings';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { agent, Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { app } from '../../../src/app';
import { blogsCollection, connectToDb, postsCollection } from '../../../src/db/collection';
import { BlogDbType } from '../../../src/types/blog-types';
import { ID } from './datasets';
import { mongoDBRepository } from '../../../src/repositories/db-repository';
import { getCurrentDate } from '../../../src/utils/dates/dates';
import { postRepository } from '../../../src/repositories/post-repository';

describe(`Endpoint (GET) - ${PATH_URL.BLOGS}`, () => {
  let req: TestAgent<Test>;

  beforeEach(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should get empty array', async () => {
    const res = await req.get(PATH_URL.BLOGS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(0);
    expect(1).toBe(1);
  });

  it('Should get not empty array', async () => {
    await mongoDBRepository.add<BlogDbType>(blogsCollection, {
      name: 'Test',
      description: 'Test description',
      websiteUrl: 'https://string.com',
    });

    const res = await req.get(PATH_URL.BLOGS).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        expect.objectContaining({
          name: 'Test',
          description: 'Test description',
          websiteUrl: 'https://string.com',
        }),
      ],
    });
  });

  it('Should get filtered array by searchNameTerm=Nikita', async () => {
    await blogsCollection.insertMany([
      {
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Sacha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Mascha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
    ]);

    const res = await req.get(`${PATH_URL.BLOGS}/?searchNameTerm=Nikita`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        expect.objectContaining({
          name: 'Nikita',
          description: 'Test description',
          websiteUrl: 'https://string.com',
        }),
      ],
    });
  });

  it('Should get second page', async () => {
    await blogsCollection.insertMany([
      {
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Sacha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Mascha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
    ]);

    const res = await req.get(`${PATH_URL.BLOGS}/?pageNumber=2&pageSize=2`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [
        expect.objectContaining({
          name: 'Mascha',
          description: 'Test description',
          websiteUrl: 'https://string.com',
        }),
      ],
    });
  });
});

describe(`Endpoint (GET) - ${PATH_URL.POSTS_FOR_BLOG}`, () => {
  let req: TestAgent<Test>;

  beforeEach(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should get filtered array', async () => {
    const insertManyResult = await blogsCollection.insertMany([
      {
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Sacha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
      {
        name: 'Mascha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      },
    ]);

    const blogId = insertManyResult.insertedIds[0].toString();

    const createdAt = getCurrentDate();
    await postsCollection.insertMany([
      {
        title: 'Nikita',
        shortDescription: 'ShortDescription',
        content: 'Content',
        blogId,
        blogName: 'Blog name',
        createdAt,
      },
      {
        title: 'Dasha',
        shortDescription: 'ShortDescription',
        content: 'Content',
        blogId,
        blogName: 'Blog name',
        createdAt,
      },
      {
        title: 'Tatiana',
        shortDescription: 'ShortDescription',
        content: 'Content',
        blogId,
        blogName: 'Blog name',
        createdAt,
      },
    ]);

    const res = await req.get(`${PATH_URL.BLOGS}/${blogId}/posts`).expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(3);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        expect.objectContaining({
          title: 'Nikita',
          shortDescription: 'ShortDescription',
          content: 'Content',
          blogId,
          blogName: 'Blog name',
          createdAt,
        }),
        expect.objectContaining({
          title: 'Dasha',
          shortDescription: 'ShortDescription',
          content: 'Content',
          blogId,
          blogName: 'Blog name',
          createdAt,
        }),
        expect.objectContaining({
          title: 'Tatiana',
          shortDescription: 'ShortDescription',
          content: 'Content',
          blogId,
          blogName: 'Blog name',
          createdAt,
        }),
      ],
    });
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req.get(`${PATH_URL.BLOGS}/${ID}/posts`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (GET) by ID - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {
  let req: TestAgent<Test>;

  beforeAll(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should get blog', async () => {
    const id = await mongoDBRepository.add<BlogDbType>(blogsCollection, {
      name: 'Test',
      description: 'Test description',
      websiteUrl: 'https://string.com',
    });

    const res = await req.get(`${PATH_URL.BLOGS}/${id.insertedId.toString()}`).expect(HTTP_STATUSES.OK_200);

    expect(res.body).toEqual(
      expect.objectContaining({
        name: 'Test',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      })
    );
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog1);

    await req.get(`${PATH_URL.BLOGS}/${ID}`).expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.BLOGS}`, () => {
  let req: TestAgent<Test>;

  beforeAll(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

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
      })
    );

    const dbRes = await mongoDBRepository.getById<BlogDbType>(blogsCollection, res.body.id);

    expect(dbRes).toEqual(
      expect.objectContaining({
        name: 'Test',
        description: 'Test description',
        websiteUrl: 'https://string.com',
      })
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
  //skip for tests
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
  let req: TestAgent<Test>;

  beforeAll(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should add post for blog', async () => {
    const insertOneResult = await blogsCollection.insertOne({
      name: 'Nikita',
      description: 'Test description',
      websiteUrl: 'https://string.com',
    });

    const blogId = insertOneResult.insertedId.toString();

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
      })
    );

    const { data } = await postRepository.getPostById(res.body.id);

    const { title, shortDescription, content, blogId: blogID, blogName } = data!;

    expect({ title, shortDescription, content, blogId, blogName }).toEqual(
      expect.objectContaining({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
        blogId: blogId,
        blogName: 'Nikita',
      })
    );
  });
});

describe(`Endpoint (PUT) - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {
  let req: TestAgent<Test>;

  beforeAll(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  afterEach(async () => {
    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should update blog', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, {
      name: 'Test',
      description: 'Test description',
      websiteUrl: 'https://string.com',
    });
    const { insertedId: id } = insertOneResult;

    await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetUpdateBlog)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const blog = await mongoDBRepository.getById<BlogDbType>(blogsCollection, id.toString());

    expect(blog).toEqual(
      expect.objectContaining({
        name: 'New test',
        description: 'New Test description',
        websiteUrl: 'https://string.ru',
      })
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
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog1)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "name" is not a string', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog2)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "name" is empty', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog3)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "description" is too long', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog4)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "description" is not a string', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog5)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog6)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "websiteUrl" is not correct', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;

    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog7)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet7);
  });
  //skip for tests
  it.skip('Should get Error while we add too many fields specified', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, data.dataSetNewBlog);

    const { insertedId: id } = insertOneResult;
    const res = await req
      .put(`${PATH_URL.BLOGS}/${id.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewBlog8)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet8);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.BLOGS}${PATH_URL.ID}`, () => {
  let req: TestAgent<Test>;

  beforeAll(async () => {
    const server = await MongoMemoryServer.create();
    await connectToDb(server.getUri());

    req = agent(app);

    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  afterEach(async () => {
    await blogsCollection.deleteMany();
    await postsCollection.deleteMany();
  });

  it('Should delete blog', async () => {
    const insertOneResult = await mongoDBRepository.add<BlogDbType>(blogsCollection, {
      name: 'Test',
      description: 'Test description',
      websiteUrl: 'https://string.com',
    });
    const { insertedId: id } = insertOneResult;

    await req
      .delete(`${PATH_URL.BLOGS}/${id.toString()}`)
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
