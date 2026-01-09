import dotenv from 'dotenv';

dotenv.config();

const parseArray = (value?: string) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []);
const parseBool = (value?: string) => value === 'true' || value === '1' || value === 'yes';

const corsList = parseArray(process.env.CORS_ORIGIN);

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '7d',
  corsOrigins: corsList.length ? corsList : ['http://localhost:3000'],
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || '',
  wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY || '',
  wompiWebhookSecret: process.env.WOMPI_WEBHOOK_SECRET || '',
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
  forceHttps: parseBool(process.env.FORCE_HTTPS)
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL no está configurado. Usa .env para definirlo.');
}

if (!env.jwtSecret || env.jwtSecret === 'change-me') {
  console.warn('JWT_SECRET débil o no configurado. Define un secreto fuerte en .env');
}
