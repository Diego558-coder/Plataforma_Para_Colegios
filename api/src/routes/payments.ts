import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { env } from '../config/env.js';

const router = Router();
const stripeClient = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

router.post('/checkout', async (req, res) => {
  const { registrationId, method } = req.body as { registrationId?: string; method?: 'CARD' | 'PSE' | 'TRANSFER' };
  if (!registrationId || !method) return res.status(400).json({ message: 'registrationId y method son requeridos' });

  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) return res.status(404).json({ message: 'Registro no encontrado' });

  const provider = method === 'CARD' ? 'stripe' : 'wompi';

  const payment = await prisma.payment.create({
    data: {
      registrationId,
      provider,
      method,
      amount: registration.amount,
      status: 'PENDING'
    }
  });

  let checkoutUrl = `https://checkout.example.com/${payment.id}`;

  if (stripeClient && provider === 'stripe') {
    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${env.publicUrl}/?status=success&registration=${registration.id}`,
        cancel_url: `${env.publicUrl}/?status=cancel&registration=${registration.id}`,
        customer_email: registration.email,
        metadata: { registrationId },
        line_items: [
          {
            price_data: {
              currency: 'cop',
              unit_amount: registration.amount * 100,
              product_data: {
                name: `Matrícula ${registration.fullName}`
              }
            },
            quantity: 1
          }
        ]
      });

      checkoutUrl = session.url || checkoutUrl;

      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerRef: session.id }
      });
    } catch (err) {
      console.error('Error creando checkout Stripe', err);
      return res.status(500).json({ message: 'No se pudo crear el pago en Stripe' });
    }
  }

  res.status(201).json({
    paymentId: payment.id,
    checkoutUrl,
    provider,
    message: stripeClient ? 'Checkout creado' : 'Pasarela simulada (configura llaves Stripe)'
  });
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  if (!stripeClient || !env.stripeWebhookSecret) return res.status(400).send('Stripe no configurado');

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Firma requerida');

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body as Buffer, sig as string, env.stripeWebhookSecret);
  } catch (err: any) {
    console.error('Webhook Stripe inválido', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registrationId;
    if (registrationId) {
      await prisma.$transaction([
        prisma.payment.updateMany({ where: { registrationId }, data: { status: 'PAID', providerRef: session.id } }),
        prisma.registration.update({ where: { id: registrationId }, data: { paymentStatus: 'PAID', status: 'APPROVED' } })
      ]);
    }
  }

  res.json({ received: true });
};

export const wompiWebhookHandler = async (req: Request, res: Response) => {
  if (!env.wompiWebhookSecret) return res.status(400).send('Wompi no configurado');

  const signature = req.headers['x-message-integrity-checksum'] as string | undefined;
  if (!signature) return res.status(400).send('Firma requerida');

  const rawBody = req.body as Buffer;
  const computed = crypto.createHmac('sha256', env.wompiWebhookSecret).update(rawBody).digest('hex');
  if (computed !== signature) return res.status(400).send('Firma inválida');

  let event: any;
  try {
    event = JSON.parse(rawBody.toString('utf-8'));
  } catch (err) {
    console.error('Webhook Wompi JSON inválido', err);
    return res.status(400).send('Payload inválido');
  }

  const registrationId = event?.data?.transaction?.reference as string | undefined;
  if (!registrationId) return res.status(400).end();

  await prisma.$transaction([
    prisma.payment.updateMany({ where: { registrationId }, data: { status: 'PAID', providerRef: event?.data?.transaction?.id } }),
    prisma.registration.update({ where: { id: registrationId }, data: { paymentStatus: 'PAID', status: 'APPROVED' } })
  ]);

  res.json({ received: true });
};

router.get('/', requireAuth(['ADMIN']), async (_req, res) => {
  const payments = await prisma.payment.findMany({ include: { registration: true }, orderBy: { createdAt: 'desc' } });
  res.json(payments);
});

router.get('/:id', requireAuth(['ADMIN', 'TEACHER', 'STUDENT']), async (req: AuthRequest, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { registration: true }
  });

  if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });

  const isAdmin = req.user?.role === 'ADMIN';
  const ownsRegistration =
    payment.registration?.userId === req.user?.id || payment.registration?.email === req.user?.email;

  if (!isAdmin && !ownsRegistration) return res.status(403).json({ message: 'Permisos insuficientes' });

  res.json(payment);
});

export default router;
