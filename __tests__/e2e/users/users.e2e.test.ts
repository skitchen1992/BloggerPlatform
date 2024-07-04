import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import TestAgent from 'supertest/lib/agent';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../../src/app';
import { createAuthorizationHeader } from '../../test-helpers';
import { SETTINGS } from '../../../src/utils/settings';
import * as data from '../users/datasets';
import { ID } from '../blogs/datasets';
import { db } from '../../../src';
import { testSeeder } from '../../test.seeder';
import { UserModel } from '../../../src/models/user';
import { UserMapper } from '../../../src/mappers/user-mapper';
import { getUniqueId } from '../../../src/utils/helpers';
import { ObjectId } from 'mongodb';
import { getCurrentDate , add} from '../../../src/utils/dates/dates';

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

describe(`Endpoint (GET) - ${PATH_URL.USERS}`, () => {
  it('Should get empty array', async () => {
    const res = await req
      .get(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(0);
  });

  it('Should get not empty array', async () => {
    const userList = await UserModel.insertMany(testSeeder.createUserListDto(1));

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
      items: userList.map((user) => (UserMapper.toUserDTO(user))),
    });
  });

  it('Should get second page', async () => {
    const userList = await UserModel.insertMany(testSeeder.createUserListDto(2));

    const res = await req
      .get(`${PATH_URL.USERS}/?pageSize=1&pageNumber=2`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 1,
      totalCount: 2,
      items: [UserMapper.toUserDTO(userList[1])],
    });
  });

  it('Should find user by login', async () => {
    const userList = await UserModel.insertMany(testSeeder.createUserListDto(2));

    const res = await req
      .get(`${PATH_URL.USERS}/?searchLoginTerm=test0`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [UserMapper.toUserDTO(userList[0])],
    });
  });

  it('Should find user by email', async () => {
    const userList = await UserModel.insertMany(testSeeder.createUserListDto(2));

    const res = await req
      .get(`${PATH_URL.USERS}/?searchEmailTerm=test0@gmail.com`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.items.length).toBe(1);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [UserMapper.toUserDTO(userList[0])],
    });
  });

  it('Should get array by filters', async () => {

    const providedUsers = [
      { login: 'loSer', password: 'string', email: 'email2p@gg.om' },
      { login: 'log01', password: 'string', email: 'emai@gg.com' },
      { login: 'log02', password: 'string', email: 'email2p@g.com' },
      { login: 'uer15', password: 'string', email: 'emarrr1@gg.com' },
      { login: 'user01', password: 'string', email: 'email1p@gg.cm' },
      { login: 'user02', password: 'string', email: 'email1p@gg.com' },
      { login: 'user03', password: 'string', email: 'email1p@gg.cou' },
      { login: 'user05', password: 'string', email: 'email1p@gg.coi' },
      { login: 'usr-1-01', password: 'string', email: 'email3@gg.com' }
    ];
    function createUsersArray(users: Array<{login: string, password: string, email: string}>): Array<any> {
      return users.map((user, index) => ({
        login: user.login,
        email: user.email,
        password: user.password,
        createdAt: getCurrentDate(),
        emailConfirmation: {
          confirmationCode: getUniqueId(),
          expirationDate: add(new Date(), { hours: 1 }),
          isConfirmed: true,
        },
        _id: new ObjectId(),
      }));
    }

    const users = createUsersArray(providedUsers);

    await UserModel.insertMany(users);

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
      }),
    );

    const dbRes = await UserModel.findById( res.body.id).lean()

    expect(dbRes).toEqual(
      expect.objectContaining({
        login: 'yqORsIlX-V',
        email: 'example@example.com',
      }),
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

  it('Should delete user', async () => {

    const userList = await UserModel.insertMany(testSeeder.createUserListDto(1));
    const userId =userList[0]._id.toString()

    await req
      .delete(`${PATH_URL.USERS}/${userId}`)
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
