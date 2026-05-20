import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbPath = "/home/bake/Documents/antygravity/3d data management/data management/nexus-dashboard/dev.db";
  const fileUrl = `file:${dbPath}`;
  
  const libsql = createClient({ url: fileUrl });
  const adapter = new PrismaLibSql(libsql);
  
  return new PrismaClient({ 
    adapter,
    log: ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;