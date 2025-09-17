const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data asynchronously
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  console.log(JSON.parse(raw))
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit = 20, page = 1, q } = req.query;
    let results = data;

    if (q) {
      results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
    }

    const total = results.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      items: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: pageNum * limitNum < total
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
  // TODO: Validate payload (intentional omission)
  const item = req.body;
  const data = await readData();
  item.id = Date.now();
  item.date = new Date().toISOString();
  // Add new item to the beginning of the list
  const newData = [item, ...data];
  await fs.writeFile(DATA_PATH, JSON.stringify(newData, null, 2));
  res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;