import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,

  mongoUri: process.env.MONGO_URI,
  clientUrls: (process.env.CLIENT_URL || '').split(',').map(url => url.trim()),

  jwtSecret: process.env.JWT_SECRET,
  adminSecretCode: process.env.ADMIN_SECRET_CODE,

  // Brevo SMTP Config
  smtp: {
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
    from: process.env.BREVO_FROM_EMAIL,
  },

  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  },

  notifyEmailTo: process.env.NOTIFY_EMAIL_TO,
};

export default Object.freeze(config)
