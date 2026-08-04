import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Because Cloudflare Workers run on Edge and don't natively have process.env for bindings,
// we initialize Prisma by passing the DATABASE_URL obtained from the Hono context (c.env.DATABASE_URL).
export const getPrisma = (connectionString: string) => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  // @ts-ignore
  const prismaInternal = new PrismaClient({ adapter });

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

  return prisma;
};

// Default export for services that read DATABASE_URL from process.env (via nodejs_compat)
// Controllers that have access to c.env should use getPrisma(c.env.DATABASE_URL) instead.
const getPrismaDefault = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set in environment');
  return getPrisma(url);
};

let prismaInstance: ReturnType<typeof getPrisma> | null = null;

const prismaProxy = new Proxy({} as ReturnType<typeof getPrisma>, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = getPrismaDefault();
    }
    const val = (prismaInstance as any)[prop];
    return typeof val === 'function' ? val.bind(prismaInstance) : val;
  }
});

export default prismaProxy;
