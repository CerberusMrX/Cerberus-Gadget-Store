/**
 * CERBERUS GADGET STORE - Analytics Controller
 * Combines Oracle + MongoDB data
 * File: backend-api/controllers/analyticsController.js
 */
const { execute } = require('../config/database');
const { ProductView, Search, PaymentAttempt, ActivityLog } = require('../config/mongodb');

// GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    // Oracle: sales data
    const salesData = await execute(
      `SELECT TRUNC(paid_at) AS sale_date, COUNT(*) AS txns, SUM(amount) AS revenue
       FROM payments WHERE status='completed' AND paid_at >= SYSDATE-:days
       GROUP BY TRUNC(paid_at) ORDER BY sale_date`,
      { days: parseInt(days) }
    );

    // MongoDB: product views (top 10)
    const topViewed = await ProductView.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - days*86400000) } } },
      { $group: { _id: '$product_id', product_name: { $first: '$product_name' }, views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // MongoDB: top searches
    const topSearches = await Search.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - days*86400000) } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // MongoDB: payment success rate
    const paymentStats = await PaymentAttempt.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - days*86400000) } } },
      { $group: { _id: '$status', count: { $sum: 1 }, total_amount: { $sum: '$amount' } } }
    ]);

    // MongoDB: peak usage hours
    const peakHours = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - days*86400000) } } },
      { $group: { _id: { $hour: '$timestamp' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        sales_by_day:   salesData.rows,
        top_products_viewed: topViewed,
        top_searches:        topSearches,
        payment_stats:       paymentStats,
        peak_usage_hours:    peakHours
      }
    });
  } catch(err){ next(err); }
};

// GET /api/analytics/revenue
exports.getRevenue = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date(Date.now()-30*86400000);
    const endDate   = end   ? new Date(end)   : new Date();

    const [oracle, mongo] = await Promise.all([
      execute(
        `SELECT * FROM vw_revenue_by_date WHERE sale_date >= :start AND sale_date <= :end`,
        { start: startDate, end: endDate }
      ),
      PaymentAttempt.aggregate([
        { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', count: { $sum:1 }, total: { $sum:'$amount' } } }
      ])
    ]);

    res.json({ success:true, data:{ revenue_by_date: oracle.rows, payment_breakdown: mongo } });
  } catch(err){ next(err); }
};

// GET /api/analytics/user-activity/:userId
exports.getUserActivity = async (req, res, next) => {
  try {
    const user_id = parseInt(req.params.userId);
    const logs = await ActivityLog.find({ user_id }).sort({ timestamp:-1 }).limit(100).lean();
    const searches = await Search.find({ user_id }).sort({ timestamp:-1 }).limit(20).lean();
    res.json({ success:true, data:{ activity_logs:logs, searches } });
  } catch(err){ next(err); }
};
