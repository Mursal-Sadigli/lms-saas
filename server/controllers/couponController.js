const { neon } = require('@neondatabase/serverless');

const createCoupon = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { code, discount_percent, course_id, max_uses, expires_at } = req.body;
    const educator_id = req.user.id;

    if (!code || !discount_percent) {
        return res.status(400).json({ success: false, message: 'Kod və endirim faizi mütləqdir' });
    }

    const result = await sql`
        INSERT INTO coupons (code, discount_percent, course_id, educator_id, max_uses, expires_at)
        VALUES (${code}, ${discount_percent}, ${course_id || null}, ${educator_id}, ${max_uses || null}, ${expires_at || null})
        RETURNING *
    `;

    res.status(201).json({ success: true, coupon: result[0] });
  } catch (err) {
    if (err.code === '23505') { 
        return res.status(400).json({ success: false, message: 'Bu kupon kodu artıq mövcuddur' });
    }
    console.error("Create coupon error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEducatorCoupons = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const educator_id = req.user.id;
    const coupons = await sql`SELECT * FROM coupons WHERE educator_id = ${educator_id} ORDER BY created_at DESC`;
    res.json({ success: true, coupons });
  } catch (err) {
    console.error("Get educator coupons error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const validateCoupon = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { code, course_id } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kupon kodu daxil edilməyib' });
    }

    const coupons = await sql`SELECT * FROM coupons WHERE code = ${code} AND is_active = true`;
    if (coupons.length === 0) {
      return res.status(404).json({ success: false, message: 'Kupon tapılmadı və ya aktiv deyil' });
    }

    const coupon = coupons[0];

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'Kuponun vaxtı bitib' });
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return res.status(400).json({ success: false, message: 'Kupon limitinə çatıb' });
    }

    // Check course match
    if (coupon.course_id !== null && course_id && coupon.course_id !== course_id) {
        return res.status(400).json({ success: false, message: 'Bu kupon bu kurs üçün keçərli deyil' });
    }

    res.json({ success: true, coupon });
  } catch (err) {
    console.error("Validate coupon error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { id } = req.params;
    const educator_id = req.user.id;
    
    await sql`DELETE FROM coupons WHERE id = ${id} AND educator_id = ${educator_id}`;
    res.json({ success: true, message: 'Kupon silindi' });
  } catch (err) {
    console.error("Delete coupon error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createCoupon, getEducatorCoupons, validateCoupon, deleteCoupon };
