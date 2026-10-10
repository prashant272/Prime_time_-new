import nodemailer from 'nodemailer';
import config from '../config/env.js';

let transporter = null;

if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port || 587,
    secure: config.smtp.port == 465, // true for 465, false for other ports
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('⚠️ SMTP not configured. Skipping email send to:', to);
    return;
  }

  try {
    const fromAddress = config.smtp.from || `"TimeMedia Admin" <${config.smtp.user}>`;
    const info = await transporter.sendMail({
      from: fromAddress, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendNominationConfirmationEmail = async (nomineeName, email) => {
  const subject = 'Your Nomination has been Received - TimeMedia';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-w-xl mx-auto;">
      <h2 style="color: #0284c7;">Nomination Received!</h2>
      <p>Dear ${nomineeName},</p>
      <p>Thank you for submitting your nomination. We have successfully received your details and our team will review them shortly.</p>
      <p>We appreciate your interest in our awards and events.</p>
      <p>Best Regards,<br><strong>TimeMedia Team</strong></p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

/**
 * Send Password Reset OTP email
 * @param {string} userName
 * @param {string} email
 * @param {string} otp
 */
export const sendPasswordResetOtpEmail = async (userName, email, otp) => {
  const subject = `${otp} is your Password Reset Verification Code - Prime Time Media`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155; }
        .wrapper { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
        .brand-header { background: #0f172a; padding: 28px 24px; text-align: center; }
        .brand-title { color: #ffffff; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; font-family: Georgia, serif; }
        .brand-subtitle { color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
        .body-content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
        .otp-container { background: #f0fdfa; border: 2px dashed #14b8a6; border-radius: 14px; padding: 22px; text-align: center; margin: 26px 0; }
        .otp-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; margin-bottom: 8px; }
        .otp-digits { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0f766e; margin: 0; font-family: 'Courier New', Courier, monospace; }
        .notice-box { background: #f8fafc; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b; margin-top: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 22px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="brand-header">
          <h1 class="brand-title">Prime Time Research Media</h1>
          <div class="brand-subtitle">Official Account Security Notification</div>
        </div>
        <div class="body-content">
          <p class="greeting">Hello ${userName || 'Valued User'},</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
            We received a request to reset the password for your Prime Time Media portal account. Use the 6-digit verification code below to authorize this request:
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <p class="otp-digits">${otp}</p>
          </div>

          <div class="notice-box">
            ⏱️ <strong>Time Sensitive:</strong> This verification code is valid for <strong>10 minutes</strong> only.<br><br>
            🔒 <strong>Security Notice:</strong> Never share this code with anyone. Prime Time staff will never ask for your verification code. If you did not request a password reset, please ignore this email safely.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Prime Time Research Media Pvt. Ltd.<br>
          C-31, Nawada Housing Complex, Shivaji Marg, New Delhi - 110059, India
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};
