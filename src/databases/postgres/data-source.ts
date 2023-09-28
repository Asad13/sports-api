import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Team, Article } from './entities';

const PORT =
  process.env.DATABASE_PORT !== undefined &&
  !isNaN(parseInt(process.env.DATABASE_PORT))
    ? parseInt(process.env.DATABASE_PORT)
    : 5432;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [Team, Article],
  migrations: [],
  subscribers: [],
});
