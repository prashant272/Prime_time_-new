import config from '../config/env.js';

/**
 * Verify Cloudflare Turnstile token with Cloudflare API
 * @param {string} token - The captcha token received from client
 * @param {string} [remoteIp] - The client IP address
 * @returns {Promise<{success: boolean, message?: string, errorCodes?: string[]}>}
 */
export const verifyTurnstileToken = async (token, remoteIp) => {
  const secretKey = config.turnstileSecretKey;
  if (!secretKey) {
    console.warn('⚠️ TURNSTILE_SECRET_KEY is not defined in environment variables.');
    return { success: false, message: 'Server CAPTCHA configuration is missing' };
  }

  if (!token) {
    return { success: false, message: 'CAPTCHA token is required' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      console.warn('Cloudflare Turnstile verification failed:', data['error-codes'] || data);
      return { success: false, errorCodes: data['error-codes'] || ['verification-failed'] };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, message: error.message };
  }
};
