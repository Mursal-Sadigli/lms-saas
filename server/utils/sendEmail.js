const nodemailer = require('nodemailer')
const { sql } = require('../config/db')

const sendEmail = async ({ to, subject, html }) => {
  try {
    const [settings] = await sql`
      SELECT smtp_host, smtp_port, smtp_user, smtp_pass, contact_email, brand_name 
      FROM platform_settings WHERE id = 1
    `
    
    if (!settings || !settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
      console.warn('⚠️ SMTP ayarları bazada tam deyil. Lütfən Super Admin tənzimləmələr ekranından daxil edin.')
      return false
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port || 465,
      secure: Number(settings.smtp_port) === 465, 
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass
      }
    })

    // "Brand Name" <support@brand.com> formatı
    const fromLine = `"${settings.brand_name || 'LearnHub'}" <${settings.contact_email || settings.smtp_user}>`

    const info = await transporter.sendMail({
      from: fromLine,
      to,
      subject,
      html
    })

    console.log('✅ Email uğurla göndərildi:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ SMTP Email göndərilmə xətası:', error.message)
    return false
  }
}

module.exports = { sendEmail }
