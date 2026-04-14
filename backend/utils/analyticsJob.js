const Transaction = require('../models/Transaction');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

const buildForecast = (timeSeries) => {
  if (!timeSeries.length) return 0;
  const values = timeSeries.map((point) => point.value);
  const weeklyChange = values.slice(1).map((value, index) => (value - values[index]) / (values[index] || 1));
  const averageGrowth = weeklyChange.reduce((sum, value) => sum + value, 0) / Math.max(weeklyChange.length, 1);
  const latest = values[values.length - 1];
  return Math.max(0, Math.round(latest * (1 + averageGrowth)));
};

const normalizeCategory = (category) => (category || 'Uncategorized').trim();

const aggregateAnalyticsSnapshot = async () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 30);

  const transactions = await Transaction.find({
    status: 'success',
    createdAt: { $gte: start, $lte: end },
  }).populate('book branch');

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount - tx.commission), 0);
  const totalSales = transactions.length;

  const branchMap = {};
  const categoryMap = {};
  const bookMap = {};
  const weeklyTotals = {};

  transactions.forEach((tx) => {
    const branchKey = tx.branch?.code || 'MAIN';
    branchMap[branchKey] = branchMap[branchKey] || {
      branch: tx.branch?._id || null,
      code: branchKey,
      name: tx.branch?.name || 'Main',
      sales: 0,
      revenue: 0,
    };
    branchMap[branchKey].sales += 1;
    branchMap[branchKey].revenue += tx.amount - tx.commission;

    const category = normalizeCategory(tx.book?.category);
    categoryMap[category] = categoryMap[category] || { category, sales: 0, revenue: 0, weekly: {} };
    categoryMap[category].sales += 1;
    categoryMap[category].revenue += tx.amount - tx.commission;

    const bookKey = tx.book?._id?.toString() || `unknown-${tx.reference}`;
    bookMap[bookKey] = bookMap[bookKey] || {
      book: tx.book?._id || null,
      title: tx.book?.title || 'Untitled',
      sales: 0,
      revenue: 0,
    };
    bookMap[bookKey].sales += 1;
    bookMap[bookKey].revenue += tx.amount - tx.commission;

    const createdAt = new Date(tx.createdAt);
    const weekNumber = Math.ceil((createdAt.getDate() + 6 - createdAt.getDay()) / 7);
    const weekKey = `${createdAt.getFullYear()}-${weekNumber}`;
    categoryMap[category].weekly[weekKey] = (categoryMap[category].weekly[weekKey] || 0) + 1;
  });

  const demandByCategory = Object.values(categoryMap).map((categoryEntry) => {
    const weeklySeries = Object.entries(categoryEntry.weekly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, value }));
    return {
      category: categoryEntry.category,
      sales: categoryEntry.sales,
      revenue: categoryEntry.revenue,
      forecast: buildForecast(weeklySeries),
    };
  });

  const topBooks = Object.values(bookMap)
    .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
    .slice(0, 10);

  const snapshot = await AnalyticsSnapshot.create({
    rangeStart: start,
    rangeEnd: end,
    totalSales,
    totalRevenue,
    revenueByBranch: Object.values(branchMap),
    demandByCategory,
    topBooks,
  });

  return snapshot;
};

const scheduleAnalyticsAggregation = () => {
  const runJob = async () => {
    try {
      await aggregateAnalyticsSnapshot();
      console.log('[AnalyticsJob] Aggregation completed');
    } catch (err) {
      console.error('[AnalyticsJob] Aggregation failed', err);
    } finally {
      setTimeout(runJob, 24 * 60 * 60 * 1000);
    }
  };
  runJob();
};

module.exports = { aggregateAnalyticsSnapshot, scheduleAnalyticsAggregation };
