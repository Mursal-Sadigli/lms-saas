const { sql } = require('../config/db')

// GET /api/courses — bütün yayımlanmış kurslar
const getAllCourses = async (req, res) => {
  const { category, search } = req.query

  let query = `
    SELECT
      c.id, c.title, c.description, c.price, c.thumbnail, c.category,
      u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name,
      ROUND(AVG(r.rating), 1) AS rating,
      COUNT(DISTINCT e.id) AS students
    FROM courses c
    JOIN users u ON c.educator_id = u.id
    LEFT JOIN reviews r ON r.course_id = c.id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.is_published = true
  `
  const params = []

  if (category && category !== 'Hamısı') {
    params.push(category)
    query += ` AND c.category = $${params.length}`
  }
  if (search) {
    params.push(`%${search}%`)
    query += ` AND (c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`
  }

  query += ` GROUP BY c.id, u.first_name, u.last_name ORDER BY students DESC`

  const courses = await sql(query, params)
  res.json({ success: true, courses })
}

// GET /api/courses/:id — kurs detalları + videolar
const getCourseById = async (req, res) => {
  const { id } = req.params

  const [course] = await sql`
    SELECT
      c.*,
      u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name,
      u.image_url AS educator_image,
      ROUND(AVG(r.rating), 1) AS rating,
      COUNT(DISTINCT e.id) AS students
    FROM courses c
    JOIN users u ON c.educator_id = u.id
    LEFT JOIN reviews r ON r.course_id = c.id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = ${id}
    GROUP BY c.id, u.first_name, u.last_name, u.image_url
  `

  if (!course) {
    return res.status(404).json({ error: 'Kurs tapılmadı' })
  }

  const videos = await sql`
    SELECT * FROM course_videos
    WHERE course_id = ${id}
    ORDER BY position ASC
  `

  const reviews = await sql`
    SELECT r.*, u.first_name, u.last_name, u.image_url
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.course_id = ${id}
    ORDER BY r.created_at DESC
  `

  res.json({ success: true, course: { ...course, videos, reviews } })
}

// POST /api/courses — yeni kurs yarat (educator)
const createCourse = async (req, res) => {
  const { title, description, price, thumbnail, category, videos } = req.body
  const educatorId = req.auth.userId

  const [course] = await sql`
    INSERT INTO courses (title, description, price, thumbnail, category, educator_id, is_published)
    VALUES (${title}, ${description}, ${price}, ${thumbnail}, ${category}, ${educatorId}, false)
    RETURNING *
  `

  if (videos && videos.length > 0) {
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      await sql`
        INSERT INTO course_videos (course_id, title, video_url, position, is_free, description, quiz)
        VALUES (${course.id}, ${v.title}, ${v.videoUrl}, ${i + 1}, ${v.isFree || false}, ${v.description || ''}, ${v.quiz ? JSON.stringify(v.quiz) : null})
      `
    }
  }

  res.status(201).json({ success: true, course })
}

// PUT /api/courses/:id/publish — kursu yayımla
const publishCourse = async (req, res) => {
  const { id } = req.params
  const educatorId = req.auth.userId

  const [settings] = await sql`SELECT require_course_approval FROM platform_settings WHERE id = 1`
  if (settings && settings.require_course_approval === true) {
    return res.status(403).json({ error: 'Sistem tənzimləmələrinə əsasən, kurs yalnız Super Admin tərəfindən təsdiqlənib yayımlana bilər.' })
  }

  const [course] = await sql`
    UPDATE courses
    SET is_published = true, updated_at = NOW()
    WHERE id = ${id} AND educator_id = ${educatorId}
    RETURNING *
  `

  if (!course) {
    return res.status(404).json({ error: 'Kurs tapılmadı və ya icazəniz yoxdur' })
  }

  res.json({ success: true, course })
}

// GET /api/courses/educator — müəllimin öz kursları
const getEducatorCourses = async (req, res) => {
  const educatorId = req.auth.userId

  const courses = await sql`
    SELECT
      c.*,
      COUNT(DISTINCT e.id) AS students,
      COALESCE(SUM(e.amount_paid), 0) AS earnings
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.educator_id = ${educatorId}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `

  res.json({ success: true, courses })
}

// PUT /api/courses/:id — kursu güncəllə
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, thumbnail, category, videos } = req.body;
  const educatorId = req.auth.userId;

  try {
    const [course] = await sql`
      UPDATE courses 
      SET title = ${title}, description = ${description}, price = ${price}, thumbnail = ${thumbnail}, category = ${category}, updated_at = NOW()
      WHERE id = ${id} AND educator_id = ${educatorId}
      RETURNING *
    `;
    
    if (!course) return res.status(404).json({ error: 'Kurs tapılmadı və ya icazəniz yoxdur' });

    // Videoları yeniləmək üçün əvvəlkiləri silirik və yenilərini daxil edirik
    await sql`DELETE FROM course_videos WHERE course_id = ${course.id}`;

    if (videos && videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        await sql`
          INSERT INTO course_videos (course_id, title, video_url, position, is_free, description, quiz)
          VALUES (${course.id}, ${v.title}, ${v.videoUrl}, ${i + 1}, ${v.isFree || false}, ${v.description || ''}, ${v.quiz ? JSON.stringify(v.quiz) : null})
        `;
      }
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: 'Kurs güncəllənərkən xəta baş verdi: ' + error.message });
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  publishCourse,
  getEducatorCourses,
  updateCourse
}
