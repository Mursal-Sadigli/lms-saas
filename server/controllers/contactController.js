const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_cSKg8rJD_LxkCs1Z3cCGXGjD9WQFSVGxK');

const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Bütün xanaları doldurun' });
  }

  try {
    const data = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: ['msadigli2025@gmail.com'], // Sizin emailiniz
      reply_to: email,
      subject: subject ? `LearnHub ${subject}` : `LearnHub Yeni Mesaj: ${name}`,
      html: `
        <h3>Saytdan yeni əlaqə mesajı</h3>
        <p><strong>Ad:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Resend xətası:", error);
    res.status(500).json({ error: 'Mesaj göndərilərkən xəta baş verdi' });
  }
};

module.exports = { sendMessage };
