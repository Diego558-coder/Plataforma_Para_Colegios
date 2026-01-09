import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: [
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' }
  ]
});

prisma.$connect()
  .then(() => console.log('✓ Conectado a la base de datos'))
  .catch((err) => {
    console.error('⚠️ Error conectando a la base de datos:', err.message);
    console.log('El servidor continuará sin conexión de BD');
  });

export { prisma };
