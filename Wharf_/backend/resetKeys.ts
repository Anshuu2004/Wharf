import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetKeys() {
  console.log('Resetting system keys...');
  await prisma.systemKey.updateMany({
    data: { isExhausted: false },
  });
  
  console.log('Resetting user keys...');
  await prisma.userApiKey.updateMany({
    data: { isExhausted: false },
  });
  
  console.log('Done!');
}

resetKeys()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
