const { Resend } = require('resend');
const resend = new Resend('re_cSKg8rJD_LxkCs1Z3cCGXGjD9WQFSVGxK');

async function testMail() {
  try {
    const data = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: ['[EMAIL_ADDRESS]'],
      subject: 'Test Mesaj',
      html: '<p>Test Mesaj HTML</p>'
    });
    console.log("SUCCESS:", data);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

testMail();
