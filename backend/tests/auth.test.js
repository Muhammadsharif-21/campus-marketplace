const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/register validation', () => {
  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ari',
      email: 'not-an-email',
      password: 'password123',
      phone: '0300 1234567',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  it('rejects a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ari',
      email: 'ari@test.com',
      password: 'short',
      phone: '0300 1234567',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  it('rejects an invalid phone number', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ari',
      email: 'ari@test.com',
      password: 'password123',
      phone: '12345',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/mobile/i);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

describe('protected routes', () => {
  it('blocks posting a listing without a token', async () => {
    const res = await request(app).post('/api/listings').send({});
    expect(res.status).toBe(401);
  });

  it('blocks my-listings without a token', async () => {
    const res = await request(app).get('/api/listings/mine');
    expect(res.status).toBe(401);
  });
});