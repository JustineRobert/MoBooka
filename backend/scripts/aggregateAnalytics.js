const dotenv = require('dotenv');
const connectDB = require('../config/db');
const { aggregateAnalyticsSnapshot } = require('../utils/analyticsJob');

dotenv.config();
connectDB();

aggregateAnalyticsSnapshot()
  .then((snapshot) => {
    console.log('Analytics snapshot created:', snapshot._id);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Analytics aggregation failed:', err);
    process.exit(1);
  });
