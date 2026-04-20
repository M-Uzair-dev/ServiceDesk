"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./config/prisma");
const redis_1 = require("./config/redis");
require("./queues/emailWorker"); // start the BullMQ worker
async function bootstrap() {
    await prisma_1.prisma.$connect();
    console.log("[DB] Connected to PostgreSQL");
    app_1.default.listen(env_1.env.port, () => {
        console.log(`[Server] Running on http://localhost:${env_1.env.port}`);
    });
}
bootstrap().catch((err) => {
    console.error("[Startup] Failed:", err);
    process.exit(1);
});
process.on("SIGTERM", async () => {
    await prisma_1.prisma.$disconnect();
    redis_1.redis.disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map