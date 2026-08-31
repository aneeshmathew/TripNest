// config/env.ts validates process.env at import time and calls
// process.exit(1) if required vars are missing — which would kill the
// whole test run. These fake values only need to satisfy that schema;
// no test in this suite makes a real DB connection (Prisma is mocked
// where used, and the request-level tests fail auth/validation before
// ever reaching Prisma).
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
