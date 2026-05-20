import { PrismaClient as Client } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: Client | undefined;
};

export const prisma = globalForPrisma.prisma ?? new Client();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;