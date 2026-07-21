const prisma = require('./prisma');

async function ensureSchema() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PageView" (
        "id" TEXT NOT NULL,
        "path" TEXT NOT NULL,
        "referrer" TEXT,
        "sessionId" TEXT NOT NULL,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "PageView"("createdAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView"("path");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx" ON "PageView"("sessionId");`);
    console.log('Schema check: PageView table ready');
  } catch (err) {
    console.error('Schema check failed:', err.message);
  }
}

module.exports = ensureSchema;
