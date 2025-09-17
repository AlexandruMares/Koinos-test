const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const itemsRouter = require('../src/routes/items');

const mockItems = [
  { id: 1, name: 'Apple', price: 10, date: '2025-09-17T10:00:00.000Z' },
  { id: 2, name: 'Banana', price: 20, date: '2025-09-16T10:00:00.000Z' },
  { id: 3, name: 'Carrot', price: 5, date: '2025-09-15T10:00:00.000Z' },
  { id: 4, name: 'Date', price: 15, date: '2025-09-14T10:00:00.000Z' }
];

describe('Items API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/items', itemsRouter);
    fs.readFile.mockReset();
    fs.writeFile.mockReset();
  });

  test('GET /api/items returns all items', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: mockItems,
      total: 4,
      page: 1,
      limit: 20,
      hasMore: false
    });
  });

  test('GET /api/items with limit', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const res = await request(app).get('/api/items?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].name).toBe('Apple');
  });

  test('GET /api/items with search query', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const res = await request(app).get('/api/items?q=banana');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].name).toBe('Banana');
  });

  test('GET /api/items/:id returns item', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Apple');
  });

  test('GET /api/items/:id returns 404 for missing item', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({});
  });

  test('POST /api/items creates item', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
    fs.writeFile.mockResolvedValue();
    const newItem = { name: 'Orange', price: 30 };
    const res = await request(app).post('/api/items').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Orange');
    expect(res.body).toHaveProperty('id');
    expect(fs.writeFile).toHaveBeenCalled();
  });

  test('GET /api/items handles read error', async () => {
    fs.readFile.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(500);
  });
});