import { createTestClient } from 'apollo-server-testing';
import sinon from 'sinon';

import { server } from '../graphql';
import { initializeDatabase } from '../orm';
import { clearDb } from '../rejson/db';

export const testClient = createTestClient(server);

before(async () => {
  const connection = await initializeDatabase();
  await connection.synchronize();
  await clearDb();
});

afterEach(async () => {
  await clearDb();
  sinon.restore();
});
