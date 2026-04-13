const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

const createAuthor = async () => {
  const user = await User.create({
    name: 'Author Tester',
    email: 'author@example.com',
    password: 'Password123!',
    role: 'author',
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '1h',
  });
  return { user, token };
};

describe('Book routes', () => {
  it('rejects book creation without authorization', async () => {
    const response = await request(app).post('/api/books').send({ title: 'Test Book' });
    expect(response.statusCode).toBe(401);
  });

  it('allows an author to create a book with valid data', async () => {
    const { token } = await createAuthor();
    const response = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Valid Book')
      .field('authors', 'Author Tester')
      .field('category', 'Fiction')
      .field('description', 'A test book')
      .field('price', '9.99');

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Valid Book');
    expect(response.body.author).toBeDefined();
  });
});
