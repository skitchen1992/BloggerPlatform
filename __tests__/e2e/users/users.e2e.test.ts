import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import TestAgent from 'supertest/lib/agent';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDb, usersCollection } from '../../../src/db/collection';
import { app } from '../../../src/app';
import { mongoDBRepository } from '../../../src/repositories/db-repository';
import { UserDbType } from '../../../src/types/users-types';
import { createAuthorizationHeader } from '../../test-helpers';
import { SETTINGS } from '../../../src/utils/settings';
import * as data from '../users/datasets';
import { ID } from '../blogs/datasets';
import { after } from 'node:test';
import { getCurrentDate } from '../../../src/utils/dates/dates';
import { db } from '../../../src';

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

describe(`Endpoint (GET) - ${PATH_URL.USERS}`, () => {
  it('Should get empty array', async () => {
    const res = await req
      .get(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(0);
  });

  it('Should get not empty array', async () => {
    const createdAt = getCurrentDate();

    const { insertedId } = await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'T8ksjEq-LV',
      password: 'string',
      email: 'example@example.com',
      createdAt,
    });

    const res = await req
      .get(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: insertedId.toString(),
          login: 'T8ksjEq-LV',
          email: 'example@example.com',
          createdAt,
        },
      ],
    });
  });

  it('Should get second page', async () => {
    const firstUserCreatedAt = getCurrentDate();

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Nik',
      password: 'string',
      email: '1@example.com',
      createdAt: firstUserCreatedAt,
    });

    const secondUserCreatedAt = getCurrentDate();

    const secondUser = await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Pig',
      password: 'string',
      email: '2@example.com',
      createdAt: secondUserCreatedAt,
    });

    const res = await req
      .get(`${PATH_URL.USERS}/?pageSize=1&pageNumber=1&searchLoginTerm=Login Pig`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 1,
      totalCount: 1,
      items: [
        {
          id: secondUser.insertedId.toString(),
          login: 'Login Pig',
          email: '2@example.com',
          createdAt: secondUserCreatedAt,
        },
      ],
    });
  });

  it('Should find user by login', async () => {
    const firstUserCreatedAt = getCurrentDate();

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Nik',
      password: 'string',
      email: '1@example.com',
      createdAt: firstUserCreatedAt,
    });

    const secondUserCreatedAt = getCurrentDate();

    const secondUser = await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Pig',
      password: 'string',
      email: '2@example.com',
      createdAt: secondUserCreatedAt,
    });

    const res = await req
      .get(`${PATH_URL.USERS}/?searchLoginTerm=Pig`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: secondUser.insertedId.toString(),
          login: 'Login Pig',
          email: '2@example.com',
          createdAt: secondUserCreatedAt,
        },
      ],
    });
  });

  it('Should find user by email', async () => {
    const firstUserCreatedAt = getCurrentDate();

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Nik',
      password: 'string',
      email: 'test@example.com',
      createdAt: firstUserCreatedAt,
    });

    const secondUserCreatedAt = getCurrentDate();

    const secondUser = await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'Login Pig',
      password: 'string',
      email: 'unio@example.com',
      createdAt: secondUserCreatedAt,
    });

    const res = await req
      .get(`${PATH_URL.USERS}/?searchEmailTerm=unio@example.com`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: secondUser.insertedId.toString(),
          login: 'Login Pig',
          email: 'unio@example.com',
          createdAt: secondUserCreatedAt,
        },
      ],
    });
  });

  it('Should get array by filters', async () => {
    const createdAt = getCurrentDate();

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'loSer',
      password: 'string',
      email: 'email2p@gg.om',
      createdAt,
    });
    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'log01',
      password: 'string',
      email: 'emai@gg.com',
      createdAt,
    });
    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'log02',
      password: 'string',
      email: 'email2p@g.com',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'uer15',
      password: 'string',
      email: 'emarrr1@gg.com',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'user01',
      password: 'string',
      email: 'email1p@gg.cm',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'user02',
      password: 'string',
      email: 'email1p@gg.com',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'user03',
      password: 'string',
      email: 'email1p@gg.cou',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'user05',
      password: 'string',
      email: 'email1p@gg.coi',
      createdAt,
    });

    await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'usr-1-01',
      password: 'string',
      email: 'email3@gg.com',
      createdAt,
    });
    const res = await req
      .get(
        `${PATH_URL.USERS}/?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.com&sortDirection=asc&sortBy=login`
      )
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(9);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 15,
      totalCount: 9,
      items: [
        expect.objectContaining({ login: 'loSer', email: 'email2p@gg.om' }),
        expect.objectContaining({ login: 'log01', email: 'emai@gg.com' }),
        expect.objectContaining({ login: 'log02', email: 'email2p@g.com' }),
        expect.objectContaining({ login: 'uer15', email: 'emarrr1@gg.com' }),
        expect.objectContaining({ login: 'user01', email: 'email1p@gg.cm' }),
        expect.objectContaining({ login: 'user02', email: 'email1p@gg.com' }),
        expect.objectContaining({ login: 'user03', email: 'email1p@gg.cou' }),
        expect.objectContaining({ login: 'user05', email: 'email1p@gg.coi' }),
        expect.objectContaining({ login: 'usr-1-01', email: 'email3@gg.com' }),
      ],
    });
  });
});

describe(`Endpoint (POST) - ${PATH_URL.USERS}`, () => {
  let req: TestAgent<Test>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectToDb(mongoServer.getUri());

    req = agent(app);

    await usersCollection.deleteMany();
  });

  after(async () => {
    await mongoServer.stop();
  });

  it('Should add user', async () => {
    const res = await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'yqORsIlX-V',
        password: 'string',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body).toEqual(
      expect.objectContaining({
        login: 'yqORsIlX-V',
        email: 'example@example.com',
      })
    );

    const dbRes = await mongoDBRepository.getById<UserDbType>(usersCollection, res.body.id);

    expect(dbRes).toEqual(
      expect.objectContaining({
        login: 'yqORsIlX-V',
        email: 'example@example.com',
      })
    );
  });

  it('Should get Error while field "login" is too long', async () => {
    const res = await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewUser1)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "password" is too long', async () => {
    const res = await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewUser2)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "email" is not correct', async () => {
    const res = await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send(data.dataSetNewUser3)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual(data.errorDataSet3);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.USERS}${PATH_URL.ID}`, () => {
  let req: TestAgent<Test>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectToDb(mongoServer.getUri());

    req = agent(app);

    await usersCollection.deleteMany();
  });

  it('Should delete user', async () => {
    const createdAt = getCurrentDate();

    const { insertedId } = await mongoDBRepository.add<UserDbType>(usersCollection, {
      login: 'T8ksjEq-LV',
      password: 'string',
      email: 'example@example.com',
      createdAt,
    });

    await req
      .delete(`${PATH_URL.USERS}/${insertedId.toString()}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get error ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    await req
      .delete(`${PATH_URL.USERS}/${ID}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});
