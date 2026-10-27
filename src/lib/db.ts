import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaInitError?: Error;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL no está definido. Revisa el archivo .env."
    );
  }
  // PrismaLibSQL expects the libsql config object (NOT an existing client).
  const adapter = new PrismaLibSQL({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  if (globalForPrisma.prismaInitError) {
    throw globalForPrisma.prismaInitError;
  }
  try {
    globalForPrisma.prisma = createPrismaClient();
    return globalForPrisma.prisma;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    globalForPrisma.prismaInitError = err;
    throw err;
  }
}

/**
 * Lazy proxy: prisma client is only created on first property access.
 * This prevents the libsql/Prisma initialization from running at module
 * load time when this file is accidentally bundled into a client chunk
 * (where process.env.TURSO_DATABASE_URL is undefined and would throw).
 *
 * On the server, the proxy transparently delegates to a real PrismaClient
 * on first access.
 */
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    return typeof value === "function"
      ? value.bind(client)
      : value;
  },
});

export const prisma = prismaProxy;
export const db = prismaProxy;
