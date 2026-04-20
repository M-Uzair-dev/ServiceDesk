import { env } from "./config/env";
import app from "./app";
import prisma from "./config/prisma";
import { redis } from "./config/redis";
import "./queues/emailWorker"; // start the BullMQ worker

async function bootstrap() {
  await prisma.$connect();
  console.log("[DB] Connected to PostgreSQL");

  app.listen(env.port, () => {
    console.log(`[Server] Running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("[Startup] Failed:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
