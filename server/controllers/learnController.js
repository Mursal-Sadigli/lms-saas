const { sql } = require('../config/db')

// GET /api/learn/:courseId — kursun videoları + istifadəçinin progress-i
const getLearnData = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.auth.userId

    // Qeydiyyatlıdırmı?
    // Qeydiyyatlıdırmı (ya fərdi ya da abunəliklə)?
    const [user] = await sql`SELECT subscription_status FROM users WHERE id = ${userId}`
    const hasSubscription = user && user.subscription_status && user.subscription_status !== 'free'

    let [enrollment] = await sql`
      SELECT id, progress FROM enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `
    if (!enrollment && !hasSubscription) {
      return res.status(403).json({ error: 'Bu kursa qeydiyyatlı deyilsiniz.' })
    }

    // Kurs + videolar
    const [course] = await sql`
      SELECT c.id, c.title
      FROM courses c WHERE c.id = ${courseId}
    `

    const videos = await sql`
      SELECT v.*,
        CASE WHEN vc.id IS NOT NULL THEN true ELSE false END AS completed
      FROM course_videos v
      LEFT JOIN video_completions vc
        ON vc.video_id = v.id AND vc.user_id = ${userId}
      WHERE v.course_id = ${courseId}
      ORDER BY v.position ASC
    `

    // Tapşırıq: birinci video həmişə açıqdır, qalanları əvvəlki tamamlanandan sonra açılır
    const videosWithAccess = videos.map((v, i) => ({
      ...v,
      unlocked: i === 0 || videos[i - 1]?.completed === true,
    }))

    const completedCount = videos.filter(v => v.completed).length
    const progress = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0

    res.json({
      success: true,
      course,
      videos: videosWithAccess,
      progress,
      progress,
      enrollmentId: enrollment ? enrollment.id : null,
    })
  } catch (err) {
    console.error('getLearnData xətası:', err)
    res.status(500).json({ error: 'Server xətası baş verdi' })
  }
}

// POST /api/learn/:videoId/complete — videonu tamamla
const completeVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    const userId = req.auth.userId

    // Video mövcuddurmu?
    const [video] = await sql`SELECT id, course_id, position FROM course_videos WHERE id = ${videoId}`
    if (!video) return res.status(404).json({ error: 'Video tapılmadı' })

    // Qeydiyyatlıdırmı?
    // Qeydiyyatlıdırmı?
    const [user] = await sql`SELECT subscription_status FROM users WHERE id = ${userId}`
    const hasSubscription = user && user.subscription_status && user.subscription_status !== 'free'

    let [enrollment] = await sql`
      SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${video.course_id}
    `
    if (!enrollment && !hasSubscription) return res.status(403).json({ error: 'Bu kursa qeydiyyatlı deyilsiniz.' })

    // Tamamlandı olaraq qeyd et
    await sql`
      INSERT INTO video_completions (user_id, video_id)
      VALUES (${userId}, ${videoId})
      ON CONFLICT (user_id, video_id) DO NOTHING
    `

    // Yeni progress hesabla
    const [{ total }] = await sql`SELECT COUNT(*) as total FROM course_videos WHERE course_id = ${video.course_id}`
    const [{ done }] = await sql`
      SELECT COUNT(*) as done FROM video_completions vc
      JOIN course_videos cv ON vc.video_id = cv.id
      WHERE vc.user_id = ${userId} AND cv.course_id = ${video.course_id}
    `

    const progress = Math.round((Number(done) / Number(total)) * 100)

    // Enrollment progress yenilə
    if (enrollment) {
      await sql`UPDATE enrollments SET progress = ${progress} WHERE user_id = ${userId} AND course_id = ${video.course_id}`
    } else {
      // Abunəlik əsasında ilk dəfə video bitirdikdə enrollments rekordunu yaradırıq ki progress-i tutaq
      await sql`
        INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid, progress)
        VALUES (${userId}, ${video.course_id}, 'subscription_access', 0, ${progress})
      `
    }

    // Növbəti videonu tap
    const [nextVideo] = await sql`
      SELECT id, title FROM course_videos
      WHERE course_id = ${video.course_id} AND position = ${video.position + 1}
    `

    res.json({ success: true, progress, nextVideoId: nextVideo?.id || null })
  } catch (err) {
    console.error('completeVideo xətası:', err)
    res.status(500).json({ error: 'Server xətası baş verdi' })
  }
}

module.exports = { getLearnData, completeVideo }
