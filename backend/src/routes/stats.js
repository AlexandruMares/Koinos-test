const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;
let lastModified = 0;

// Helper to calculate stats
function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
  };
}

// Watch for file changes and update cache
fs.watchFile(DATA_PATH, { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    fs.readFile(DATA_PATH, (err, raw) => {
      if (!err) {
        try {
          const items = JSON.parse(raw);
          cachedStats = calculateStats(items);
          lastModified = curr.mtimeMs;
        } catch (e) {
          cachedStats = null;
        }
      }
    });
  }
});

// Initial cache population
fs.readFile(DATA_PATH, (err, raw) => {
  if (!err) {
    try {
      const items = JSON.parse(raw);
      cachedStats = calculateStats(items);
      lastModified = Date.now();
    } catch (e) {
      cachedStats = null;
    }
  }
});

// GET /api/stats
router.get('/', (req, res, next) => {
  if (cachedStats) {
    res.json(cachedStats);
  } else {
    fs.readFile(DATA_PATH, (err, raw) => {
      if (err) return next(err);

      try {
        const items = JSON.parse(raw);
        const stats = calculateStats(items);
        cachedStats = stats;
        res.json(stats);
      } catch (e) {
        next(e);
      }
    });
  }
});

module.exports = router;