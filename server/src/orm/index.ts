import { Connection, createConnection } from 'typeorm';

let connection: Connection;

export async function initializeDatabase() {
  if (!connection) {
    connection = await createConnection();
  }

  return connection;
}
