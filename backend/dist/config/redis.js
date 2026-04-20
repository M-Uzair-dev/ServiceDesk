"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redis = new ioredis_1.default({
    host: env_1.env.redis.host,
    port: env_1.env.redis.port,
    maxRetriesPerRequest: null, // required by BullMQ
});
exports.redis.on("error", (err) => {
    console.error("[Redis] connection error:", err.message);
});
//# sourceMappingURL=redis.js.map