import { PrismaClient } from '@prisma/client';

// Shared Prisma client instance
// DATABASE_URL is read from .env automatically
export const prisma = new PrismaClient();

