import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { stripeWebhookHandler, wompiWebhookHandler } from './routes/payments.js';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.post('/api/payments/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.post('/api/payments/webhooks/wompi', express.raw({ type: 'application/json' }), wompiWebhookHandler);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

if (env.forceHttps) {
	app.use((req, res, next) => {
		if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
		if (req.path.startsWith('/api/payments/webhooks')) return next();
		const target = `https://${req.headers.host}${req.originalUrl}`;
		return res.redirect(301, target);
	});
}

app.use('/api', router);
app.use(errorHandler);

export default app;
