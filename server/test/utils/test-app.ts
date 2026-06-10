import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export interface TestContext {
  app: INestApplication;
  connection: Connection;
  mongoServer: MongoMemoryServer;
}

/**
 * Boots a full Nest application backed by an in-memory MongoDB instance, wired
 * with the same global ValidationPipe and exception filter as production so the
 * validation decorators behave exactly like the runtime application.
 */
export async function createTestApp(): Promise<TestContext> {
  const mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-please-ignore';
  process.env.JWT_EXPIRES_IN = '1h';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  const connection = app.get<Connection>(getConnectionToken());

  return { app, connection, mongoServer };
}

/** Removes every document from all collections so each test starts clean. */
export async function clearDatabase(connection: Connection): Promise<void> {
  const collections = connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
}

export async function closeTestApp(context: TestContext): Promise<void> {
  await context.app.close();
  await context.mongoServer.stop();
}
