import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaInitError?: Error;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL no está definido. Revisa el archivo .env.",
    );
  }
  const libsql = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

/**
 * Lazy proxy: prisma client is only created on first property access.
 * This prevents build-time evaluation of the libsql client when env
 * vars aren't available (e.g. during `next build` prerendering).
 */
const prismaProxy = new Proxy(
  {} as PrismaClient,
  {
    get(_target, prop) {
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (globalForPrisma.prisma as any)[prop];
      return typeof value === "function" ? value.bind(globalForPrisma.prisma) : value;
    },
  },
);

export const prisma = prismaProxy;
export const db = prismaProxy;
