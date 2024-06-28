import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import TestAgent from 'supertest/lib/agent';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDb, db } from '../../../src/db/collection';
import { app } from '../../../src/app';
import { createAuthorizationHeader } from '../../test-helpers';
import { SETTINGS } from '../../../src/utils/settings';
import { testSeeder } from '../../test.seeder';
import { createUserWithConfirmationService } from '../../../src/services/create-user-with-confirmation-service';

let req: TestAgent<Test>;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectToDb(mongoServer.getUri());

  req = agent(app);

  await db.dropDatabase();
});

beforeEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  await db.dropDatabase();
  await mongoServer.stop();
});

describe(`Endpoint (POST) - ${PATH_URL.AUTH.LOGIN}`, () => {
  it(`Should get status ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        loginOrEmail: 'login',
        password: 'password',
      })
      .expect(HTTP_STATUSES.OK_200);
  });

  it(`Should get status ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.CREATED_201);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        loginOrEmail: 'logi',
        password: 'password',
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get status ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    await req
      .post(PATH_URL.USERS)
      .set(createAuthorizationHeader(SETTINGS.ADMIN_AUTH_USERNAME, SETTINGS.ADMIN_AUTH_PASSWORD))
      .send({
        login: 'l',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });
});

describe(`Endpoint (POST) - ${PATH_URL.AUTH.REGISTRATION}`, () => {
  it(`Should get status ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION}`)
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get status ${HTTP_STATUSES.BAD_REQUEST_400}`, async () => {
    const data = testSeeder.createUserDto();

    await createUserWithConfirmationService(data);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.REGISTRATION}`)
      .send({
        login: data.login,
        password: data.password,
        email: data.email,
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Email or login already exist',
          field: 'login',
        },
      ],
    });
  });
});
