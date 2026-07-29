import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async () => {
  // Disconnect Prisma client So Jest Can Exit Cleanly
  await prisma.$disconnect();
};
