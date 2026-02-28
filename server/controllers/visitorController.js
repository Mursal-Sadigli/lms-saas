const { sql } = require('../config/db')

const trackVisitor = async (req, res) => {
  try {
    const { device, browser, page_visited } = req.body
    
    // IP adresini proxy-dən asılı olaraq düzgün oxumaq
    let ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Naməlum IP'
    if (typeof ip_address === 'string' && ip_address.includes(',')) {
       ip_address = ip_address.split(',')[0].trim()
    }
    
    await sql`
      INSERT INTO visitors_log (ip_address, device, browser, page_visited)
      VALUES (${ip_address}, ${device}, ${browser}, ${page_visited})
    `
    res.json({ success: true })
  } catch (error) {
    console.error('Track visitor error:', error)
    // Frontend-i sındırmamaq üçün sessizcə uğursuzluq (silently catch)
    res.status(500).json({ error: 'Tracker error' })
  }
}

module.exports = {
  trackVisitor
}
