"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(key) {
    const val = process.env[key];
    if (!val)
        throw new Error(`Missing env var: ${key}`);
    return val;
}
exports.env = {
    port: parseInt(process.env.PORT ?? "3000"),
    nodeEnv: process.env.NODE_ENV ?? "development",
    databaseUrl: required("DATABASE_URL"),
    jwt: {
        accessSecret: required("JWT_ACCESS_SECRET"),
        refreshSecret: required("JWT_REFRESH_SECRET"),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    },
    redis: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: parseInt(process.env.REDIS_PORT ?? "6379"),
    },
    smtp: {
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT ?? "587"),
        user: required("SMTP_USER"),
        pass: required("SMTP_PASS"),
        from: process.env.EMAIL_FROM ?? "Assessment App <noreply@example.com>",
    },
};
//# sourceMappingURL=env.js.map