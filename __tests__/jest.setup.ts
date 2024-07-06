import { agent, Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import TestAgent from 'supertest/lib/agent';
import { db } from '../src/db/connection';

export let req: TestAgent<Test>;


let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({instance:{port: 3001}});
  const uri = mongoServer.getUri();

  await db.connect(uri);

  req = agent(app);
});

afterEach(async () => {
  await db.cleanDB();

});

afterAll(async () => {
  await db.dropDB();
  await db.disconnect();
  await mongoServer.stop();
});
