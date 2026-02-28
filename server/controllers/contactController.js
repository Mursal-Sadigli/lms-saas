const { sendEmail } = require('../utils/sendEmail');
const { sql } = require('../config/db');

const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Bütün xanaları doldurun' });
  }

  try {
    // Adminin tənzimlədiyi e-poçt ünvanını (və ya defolt olaraq admin ünvanını) çək
    const [settings] = await sql`SELECT contact_email FROM platform_settings WHERE id = 1`;
    const toEmail = settings?.contact_email || 'sadiqli2024@gmail.com';

    const emailSent = await sendEmail({
      to: toEmail,
      subject: subject ? `LearnHub: ${subject}` : `LearnHub Yeni Mesaj: ${name}`,
      html: `
        <h3>Saytdan yeni əlaqə mesajı</h3>
        <p><strong>Göndərən Adı:</strong> ${name}</p>
        <p><strong>Göndərən Email:</strong> ${email}</p>
        <hr/>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    if (!emailSent) {
       return res.status(400).json({ error: 'SMTP Server Tənzimləməsi tam deyil. Lütfən Super Admin Panelindən (SMTP) bölməsini doldurun.' });
    }

    res.status(200).json({ success: true, message: 'Mesaj uğurla göndərildi' });
  } catch (error) {
    console.error("Əlaqə Formu Xətası:", error);
    res.status(500).json({ error: 'Mesaj göndərilərkən daxili xəta baş verdi' });
  }
};

module.exports = { sendMessage };
