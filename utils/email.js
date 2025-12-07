const nodemailer = require('nodemailer');

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@dealfinder.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('WARNING: Email service not configured for production. Emails will be logged to console instead.');
      return {
        sendMail: async (opts) => {
          console.log('----------------------------------------------------');
          console.log('PRODUCTION MOCK EMAIL (Service not configured)');
          console.log('To:', opts.to);
          console.log('Subject:', opts.subject);
          console.log('Content:', opts.html || opts.text);
          console.log('----------------------------------------------------');
          return { messageId: 'mock-production-id-' + Date.now() };
        }
      };
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Use ethereal.email or console logging
    console.log('Development mode: Email will be logged to console');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal.password',
      },
    });
  }
};

let transporter = createTransporter();

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Boole Deals',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #29a867;">Welcome to Boole Deals!</h2>
        <p>Hi ${username},</p>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #29a867; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log('Email would be sent:', mailOptions);
      return { success: false, message: 'Email service not configured' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, username, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - Boole Deals',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #29a867;">Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #29a867; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log('Email would be sent:', mailOptions);
      return { success: false, message: 'Email service not configured' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
