const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

const registerPayload = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
  phone: '+256700000000',
};

describe('Auth API', () => {
  it('registers a new reader account and returns a token', async () => {
    const response = await request(app).post('/api/auth/register').send(registerPayload);
    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(registerPayload.email);
    const createdUser = await User.findOne({ email: registerPayload.email });
    expect(createdUser).toBeTruthy();
    expect(createdUser.role).toBe('reader');
  });

  it('prevents duplicate registration with the same email', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const duplicate = await request(app).post('/api/auth/register').send(registerPayload);
    expect(duplicate.statusCode).toBe(400);
    expect(duplicate.body.message).toMatch(/already registered/i);
  });

  it('authenticates a user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password,
    });
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe(registerPayload.email);
  });
});
