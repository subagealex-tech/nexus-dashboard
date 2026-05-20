import pkg from '@prisma/client';
const { PrismaClient } = pkg as { PrismaClient: typeof import('@prisma/client').PrismaClient };

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;