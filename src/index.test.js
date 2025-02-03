import request from 'supertest';
import { app } from './index.js';
import { redisClient } from './config/redis.js';

// Mock Redis client
jest.mock('./config/redis.js', () => {
  const redisMock = {
    connect: jest.fn(),
    // get: jest.fn((key) => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve('OK')),
    del: jest.fn(() => Promise.resolve(1)),
    sendCommand: jest.fn(() => Promise.resolve('OK')),
    quit: jest.fn(() => Promise.resolve()),
  };
  return { redisClient: redisMock };
});

describe('Express App', () => {
  afterAll(async () => {
    // Close the Redis connection after all tests are done
    await redisClient.quit();
  });

  // Healthcheck route
  it('should return 200 and "OK!" for /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK!');
  });

  // Ping route
  it('should return 200 and "pong" for /ping', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('pong');
  });

  // Swagger Docs
  it('should serve Swagger documentation on /api-docs', async () => {
    const response = await request(app).get('/api-docs').redirects(1); // Follow up to 1 redirect
    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
  });

  it('should return Swagger JSON from /api-docs.json', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi', '3.0.0');
    expect(res.body.info).toHaveProperty('title');
  });
});
