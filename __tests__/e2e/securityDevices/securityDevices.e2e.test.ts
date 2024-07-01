import { HTTP_STATUSES, PATH_URL } from '../../../src/utils/consts';
import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDb, db } from '../../../src/db/collection';
import { app } from '../../../src/app';
import TestAgent from 'supertest/lib/agent';
import { testSeeder } from '../../test.seeder';
import { ID } from './datasets';
import { userService } from '../../../src/services/user-service';

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

describe(`Endpoint (GET) - ${PATH_URL.SECURITY.DEVICES}`, () => {
  it('Should get 2 devices', async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie = res.headers['set-cookie'];

    const devises = await req
      .get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.OK_200);

    expect(devises.body.length).toBe(2);
  });

  it(`Should get status ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    await req.get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.SECURITY.DEVICES}`, () => {
  it('Should get 0 devices', async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie = res.headers['set-cookie'];

    await req
      .delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get status ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    await req.delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });
});

describe(`Endpoint (DELETE) - ${PATH_URL.SECURITY.DEVICE_ID}`, () => {
  it(`Should get 0 devices ${HTTP_STATUSES.NO_CONTENT_204}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie = res.headers['set-cookie'];

    const devises = await req
      .get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.OK_200);

    await req
      .delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}/${devises.body.at(0).deviceId}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  it(`Should get status ${HTTP_STATUSES.UNAUTHORIZED_401}`, async () => {
    await req.delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`Should get status ${HTTP_STATUSES.FORBIDDEN_403}`, async () => {
    const data = testSeeder.createUserListDto(2);

    for (const item of data) {
      await userService.createUser(item);
    }

    const res1 = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data[0].login,
        password: data[0].password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie1 = res1.headers['set-cookie'];

    const res2 = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data[1].login,
        password: data[1].password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie2 = res2.headers['set-cookie'];

    const devises1 = await req
      .get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie1)
      .expect(HTTP_STATUSES.OK_200);

    const devises2 = await req
      .get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie1)
      .expect(HTTP_STATUSES.OK_200);

    await req
      .delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}/${devises1.body.at(0).deviceId}`)
      .set('Cookie', cookie2)
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it(`Should get status ${HTTP_STATUSES.NOT_FOUND_404}`, async () => {
    const data = testSeeder.createUserDto();

    await userService.createUser(data);

    await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const res = await req
      .post(`${PATH_URL.AUTH.ROOT}${PATH_URL.AUTH.LOGIN}`)
      .send({
        loginOrEmail: data.login,
        password: data.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookie = res.headers['set-cookie'];

    await req
      .get(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.OK_200);

    await req
      .delete(`${PATH_URL.SECURITY.ROOT}${PATH_URL.SECURITY.DEVICES}/${ID}`)
      .set('Cookie', cookie)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });
});
