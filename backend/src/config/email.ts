import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️  SMTP_USER / SMTP_PASS tanımlı değil, email gönderimi devre dışı');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transporter = createTransporter();
const FROM = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@mutluet.org';

export async function sendMagicLink(to: string, magicLink: string): Promise<boolean> {
  if (!transporter) return false;

  await transporter.sendMail({
    from: `"Mutluet" <${FROM}>`,
    to,
    subject: 'Mutluet - Giriş Bağlantınız',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Merhaba!</h2>
        <p>Mutluet'e giriş yapmak için aşağıdaki butona tıklayın.</p>
        <p>Bu bağlantı <strong>15 dakika</strong> geçerlidir.</p>
        <a href="${magicLink}"
           style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Giriş Yap
        </a>
        <p style="color:#888;font-size:12px;">Bu e-postayı siz istemediyseniz görmezden gelin.</p>
      </div>
    `,
  });
  return true;
}

export async function sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
  if (!transporter) return false;

  await transporter.sendMail({
    from: `"Mutluet" <${FROM}>`,
    to,
    subject: 'Mutluet - Şifre Sıfırlama',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
        <p>Bu bağlantı <strong>15 dakika</strong> geçerlidir.</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Şifremi Sıfırla
        </a>
        <p style="color:#888;font-size:12px;">Bu e-postayı siz istemediyseniz görmezden gelin.</p>
      </div>
    `,
  });
  return true;
}

export async function sendWelcome(to: string, name: string): Promise<boolean> {
  if (!transporter) return false;

  await transporter.sendMail({
    from: `"Mutluet" <${FROM}>`,
    to,
    subject: 'Mutluet\'e Hoş Geldiniz!',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Hoş geldiniz, ${name}!</h2>
        <p>Mutluet ailesine katıldığınız için teşekkürler. Gönüllülük ve bağış platformumuzu keşfetmeye başlayabilirsiniz.</p>
        <a href="${process.env.FRONTEND_URL}/home"
           style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Platforma Git
        </a>
      </div>
    `,
  });
  return true;
}
