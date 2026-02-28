const { sql } = require('../config/db')

// GET /api/certificates/my — Tələbənin qazandığı sertifikatlar
const getMyCertificates = async (req, res) => {
  try {
    const userId = req.auth.userId
    const certificates = await sql`
      SELECT 
        ce.id, ce.issued_at, 
        c.title AS course_title, c.thumbnail AS course_thumbnail,
        u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name
      FROM certificates ce
      JOIN courses c ON ce.course_id = c.id
      JOIN users u ON c.educator_id = u.id
      WHERE ce.user_id = ${userId}
      ORDER BY ce.issued_at DESC
    `
    res.json({ success: true, certificates })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/certificates/verify/:id — İctimai Sertifikat Yoxlanışı və Görünüşü
const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params
    const [cert] = await sql`
      SELECT 
        ce.id, ce.issued_at,
        c.title AS course_title,
        c.id AS course_id,
        stu.first_name || ' ' || COALESCE(stu.last_name, '') AS student_name,
        edu.first_name || ' ' || COALESCE(edu.last_name, '') AS educator_name
      FROM certificates ce
      JOIN courses c ON ce.course_id = c.id
      JOIN users stu ON ce.user_id = stu.id
      JOIN users edu ON c.educator_id = edu.id
      WHERE ce.id = ${id}
    `
    if (!cert) {
      return res.status(404).json({ error: 'Sertifikat tapılmadı və ya qeydiyyatdan keçməyib.' })
    }
    
    res.json({ success: true, certificate: cert })
  } catch (error) {
    // Əgər UUID düzgün formatda deyilsə postgres error atır. Onu tuturuq
    res.status(404).json({ error: 'Sertifikat tapılmadı' })
  }
}

module.exports = { getMyCertificates, getCertificateById }
