import { PrismaClient, Prisma } from '@prisma/client';

// Prevent Multiple Instances Of Prisma Client In Development
declare global {
  var prismaInternal: PrismaClient | undefined;
}

const prismaInternal = global.prismaInternal || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaInternal = prismaInternal;
}

// Attach A Resilience Wrapper To Automatically Retry Network Drops
const prisma = prismaInternal.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        let retries = 3;
        while (retries > 0) {
          try {
            return await query(args);
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              // P1001 = Can't Reach DB, P2024 = Connection Pool Timeout, P1017 = Connection Closed
              if (['P1001', 'P2024', 'P1017'].includes(error.code)) {
                retries--;
                if (retries === 0) throw error;
                console.warn(
                  `[PRISMA RETRY] DB connection issue (${error.code}). Retrying in 1 second...`
                );
                await new Promise((res) => setTimeout(res, 1000));
                continue;
              }
            }
            throw error;
          }
        }
      },
    },
  },
}) as unknown as PrismaClient; // Cast Back To Standard PrismaClient To Avoid Strict TS Extension Drift Elsewhere

export default prisma;
