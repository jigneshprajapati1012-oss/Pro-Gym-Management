import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  message: string
) => {
  const info = await transporter.sendMail({
    from: `"SFW THE GYM" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: message
  });

  console.log('EMAIL SENT:', info.messageId);

  return info;
};