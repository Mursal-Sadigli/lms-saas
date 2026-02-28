const { sql } = require('../config/db')

const syncUserStreak = async (req, res) => {
  const userId = req.auth.userId
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const users = await sql`SELECT streak_count, last_login_date, xp FROM users WHERE id = ${userId}`
    if (users.length === 0) return res.status(404).json({ error: 'İstifadəçi tapılmadı' })
    
    let { streak_count, last_login_date, xp } = users[0]
    
    const now = new Date()
    // Streak məntiqi (Azərbaycan vaxtı və ya UTC nəzərə alınmaqla)
    if (!last_login_date) {
      streak_count = 1
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const last = new Date(last_login_date)
      last.setHours(0, 0, 0, 0)
      
      const diffTime = today.getTime() - last.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Növbəti gün daxil olub
        streak_count += 1
      } else if (diffDays > 1) {
        // Seriya qırılıb (1 gündən çox keçibsə)
        streak_count = 1
      }
      // if diffDays === 0, sames day login, do not change streak
    }

    const updated = await sql`
      UPDATE users 
      SET streak_count = ${streak_count}, last_login_date = NOW()
      WHERE id = ${userId}
      RETURNING streak_count, xp
    `
    res.json(updated[0])
  } catch (error) {
    console.error('Streak xətası:', error)
    res.status(500).json({ error: 'Server xətası' })
  }
}

const earnXP = async (req, res) => {
  const userId = req.auth.userId
  const { amount } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Yanlış məbləğ' })

  try {
    const updated = await sql`
      UPDATE users 
      SET xp = COALESCE(xp, 0) + ${amount}
      WHERE id = ${userId}
      RETURNING xp, streak_count
    `
    res.json(updated[0])
  } catch (error) {
    console.error('XP artırma xətası:', error)
    res.status(500).json({ error: 'Server xətası' })
  }
}

const getLeaderboard = async (req, res) => {
  try {
    const leaders = await sql`
      SELECT id, first_name, last_name, image_url, xp, streak_count
      FROM users
      WHERE role = 'student' AND xp > 0
      ORDER BY xp DESC, streak_count DESC
      LIMIT 10
    `
    res.json(leaders)
  } catch (error) {
    console.error('Leaderboard fetch xətası:', error)
    res.status(500).json({ error: 'Server xətası' })
  }
}

module.exports = {
  syncUserStreak,
  earnXP,
  getLeaderboard
}
