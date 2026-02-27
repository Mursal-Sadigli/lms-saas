const { neon } = require('@neondatabase/serverless');

const getAnalytics = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const educator_id = req.user.id;
    
    // Yalnız son 30 günün datası
    const sales = await sql`
      SELECT 
        DATE(e.enrolled_at) as date,
        SUM(e.amount_paid) as total_revenue,
        COUNT(e.id) as total_enrollments
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.educator_id = ${educator_id}
        AND e.enrolled_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(e.enrolled_at)
      ORDER BY DATE(e.enrolled_at) ASC
    `;

    res.json({ success: true, sales });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAnalytics };
