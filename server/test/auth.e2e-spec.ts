import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import {
  clearDatabase,
  closeTestApp,
  createTestApp,
  TestContext,
} from './utils/test-app';

interface AuthResponseBody {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const validUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Passw0rd!',
};

describe('AuthController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
    connection = context.connection;
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  // Clear the users collection before every test so cases are isolated.
  beforeEach(async () => {
    await clearDatabase(connection);
  });

  const httpServer = () => app.getHttpServer() as Server;

  describe('POST /auth/signup', () => {
    it('creates a user with valid data and never returns the password hash', async () => {
      const response = await request(httpServer())
        .post('/auth/signup')
        .send(validUser)
        .expect(201);

      const body = response.body as AuthResponseBody;
      expect(body.user).toEqual({
        id: expect.any(String),
        name: validUser.name,
        email: validUser.email,
      });
      expect(typeof body.accessToken).toBe('string');
      expect(body.accessToken.length).toBeGreaterThan(0);

      // Password (plaintext or hash) must not leak anywhere in the payload.
      const serialized = JSON.stringify(response.body);
      expect(serialized).not.toContain(validUser.password);
      expect(response.body.user).not.toHaveProperty('password');

      // Confirm it was persisted as a bcrypt hash, not plaintext.
      const stored = await connection
        .collection('users')
        .findOne({ email: validUser.email });
      expect(stored?.password).toBeDefined();
      expect(stored?.password).not.toBe(validUser.password);
      expect(stored?.password).toMatch(/^\$2[aby]\$/);
    });

    it('returns 400 when the name is too short', async () => {
      const response = await request(httpServer())
        .post('/auth/signup')
        .send({ ...validUser, name: 'Al' })
        .expect(400);

      expect(response.body.message).toContain(
        'Name must be at least 3 characters long',
      );
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });

    it('returns 400 when the email is malformed', async () => {
      const response = await request(httpServer())
        .post('/auth/signup')
        .send({ ...validUser, email: 'not-an-email' })
        .expect(400);

      expect(response.body.message).toContain(
        'A valid email address is required',
      );
    });

    it.each([
      {
        password: 'abc1!',
        expected: 'Password must be at least 8 characters long',
        email: 'shortpass@example.com',
      },
      {
        password: 'abcdefgh',
        expected:
          'Password must contain at least one letter, one number and one special character',
        email: 'no-number@example.com',
      },
      {
        password: '12345678!',
        expected:
          'Password must contain at least one letter, one number and one special character',
        email: 'no-letter@example.com',
      },
      {
        password: 'abcdefgh1',
        expected:
          'Password must contain at least one letter, one number and one special character',
        email: 'no-special@example.com',
      },
    ])(
      'returns 400 when the password is "$password"',
      async ({ password, expected, email }) => {
        const response = await request(httpServer())
          .post('/auth/signup')
          .send({ ...validUser, email, password })
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain(expected);
      },
    );

    it('returns 409 when the email already exists', async () => {
      await request(httpServer()).post('/auth/signup').send(validUser).expect(201);

      const response = await request(httpServer())
        .post('/auth/signup')
        .send(validUser)
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toBe(
        'An account with this email already exists',
      );
    });
  });

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      await request(httpServer()).post('/auth/signup').send(validUser).expect(201);
    });

    it('authenticates valid credentials and returns a signed JWT', async () => {
      const response = await request(httpServer())
        .post('/auth/signin')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      const body = response.body as AuthResponseBody;
      expect(body.user.email).toBe(validUser.email);
      expect(typeof body.accessToken).toBe('string');

      // A JWT is three base64url segments separated by dots.
      const segments = body.accessToken.split('.');
      expect(segments).toHaveLength(3);

      const payload = JSON.parse(
        Buffer.from(segments[1], 'base64url').toString('utf8'),
      ) as JwtPayload;
      expect(payload.email).toBe(validUser.email);
      expect(payload.sub).toEqual(expect.any(String));
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('returns 401 when the password is incorrect', async () => {
      const response = await request(httpServer())
        .post('/auth/signin')
        .send({ email: validUser.email, password: 'WrongPass1!' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('returns 401 when the email is not registered', async () => {
      const response = await request(httpServer())
        .post('/auth/signin')
        .send({ email: 'unknown@example.com', password: validUser.password })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it.each([
      {
        payload: { email: 'not-an-email', password: validUser.password },
        expected: 'A valid email address is required',
      },
      {
        payload: { email: validUser.email, password: '' },
        expected: 'Password is required',
      },
    ])(
      'returns 400 for invalid signin payload %j',
      async ({ payload, expected }) => {
        const response = await request(httpServer())
          .post('/auth/signin')
          .send(payload)
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain(expected);
      },
    );
  });
});
