import Redis from 'ioredis';

import { initializeDatabase } from '../../orm';

/**
 * Singleton that retrieves the database client
 */

let client: Redis.Redis;
export function getDb() {
  if (client) {
    return client;
  }

  client = new Redis({
    host: process.env.REDIS_HOST,
    port: (process.env.REDIS_PORT as unknown) as number,
  });
  handleKernelKillSignals();
  return client;
}

/**
 * Delete all keys of the current database.
 * Particularly useful in a unit test enviroment.
 */
export async function clearDb() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('You tried to drop the production database, silly!');
  }
  if (client) {
    await client.flushall();
  }

  const connection = await initializeDatabase();
  const runner = connection.createQueryRunner();

  await runner.query('SET FOREIGN_KEY_CHECKS = 0');
  const p = connection.entityMetadatas.map(async e => {
    return runner.clearTable(e.name.toLowerCase());
  });
  await Promise.all(p);
  await runner.query('SET FOREIGN_KEY_CHECKS = 1');
}

function handleKernelKillSignals() {
  // common interrupt signals.
  const signals: NodeJS.Signals[] = ['SIGHUP', 'SIGINT', 'SIGTERM']; // maybe SIGKILL and SIGSTOP?

  for (const signal of signals) {
    process.on(signal, () => {
      client.disconnect;
      process.exit(1);
    });
  }
}
