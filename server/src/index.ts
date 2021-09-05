import 'reflect-metadata';

import { config } from 'dotenv';

import { GearsClient } from './gears/gears';
import { server } from './graphql';
import { initializeDatabase } from './orm';
import { getRediSearch } from './redisearch/client';
import { getDb } from './rejson/db';
import { setUpTestData } from './test/util';
import { Timeseries } from './timeseries/client';

config();

export const gears = new GearsClient();
export const timeseries = new Timeseries();

async function main() {
  const search = await getRediSearch();
  const db = await initializeDatabase();

  //await gears.initialize();
  //await timeseries.initialize();

  server.listen().then((data: any) => {
    console.log(`🚀  Server ready at ${data.url}`);
  })
  .catch(e => console.error);
}

main().catch((e) => console.error(e));
