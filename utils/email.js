const { Resend } = require('resend');

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  console.warn('WARNING: RESEND_API_KEY not found. Emails will be logged to console instead.');
}

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const emailContent = {
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
    if (!resend) {
      console.log('----------------------------------------------------');
      console.log('MOCK EMAIL (Resend not configured)');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Verification URL:', verificationUrl);
      console.log('----------------------------------------------------');
      return { success: false, message: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent successfully:', data.id);
    return { success: true, messageId: data.id };
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

  const emailContent = {
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
    if (!resend) {
      console.log('----------------------------------------------------');
      console.log('MOCK EMAIL (Resend not configured)');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Reset URL:', resetUrl);
      console.log('----------------------------------------------------');
      return { success: false, message: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
