const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { scheduleAnalyticsAggregation } = require('./utils/analyticsJob');
const app = require('./app');

dotenv.config();
connectDB();
if (process.env.ANALYTICS_JOB_ENABLED !== 'false') {
  scheduleAnalyticsAggregation();
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`MoBooka API running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  server.close(() => process.exit(1));
});
