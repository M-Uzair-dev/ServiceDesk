"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middleware/errorHandler");
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
function signAccess(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.accessSecret, {
        expiresIn: env_1.env.jwt.accessExpiresIn,
    });
}
function signRefresh(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.refreshSecret, {
        expiresIn: env_1.env.jwt.refreshExpiresIn,
    });
}
async function storeRefreshToken(userId, token) {
    await redis_1.redis.setex(`refresh:${userId}`, REFRESH_TTL_SECONDS, token);
}
async function findUserByRole(email, role) {
    if (role === "ADMIN")
        return prisma_1.prisma.admin.findUnique({ where: { email } });
    if (role === "CLIENT")
        return prisma_1.prisma.client.findUnique({ where: { email } });
    if (role === "TECHNICIAN")
        return prisma_1.prisma.technician.findUnique({ where: { email } });
}
async function login(email, password, role) {
    const user = await findUserByRole(email, role);
    if (!user)
        throw new errorHandler_1.AppError(401, "Invalid credentials");
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        throw new errorHandler_1.AppError(401, "Invalid credentials");
    if (role === "TECHNICIAN") {
        const tech = user;
        if (tech.status === "SUSPENDED")
            throw new errorHandler_1.AppError(403, "Account suspended");
    }
    const payload = { sub: user.id, role, email: user.email };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    await storeRefreshToken(user.id, refreshToken);
    if (role === "CLIENT") {
        await prisma_1.prisma.client.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
    }
    return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role },
    };
}
async function refresh(token) {
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.refreshSecret);
    }
    catch {
        throw new errorHandler_1.AppError(401, "Invalid refresh token");
    }
    const stored = await redis_1.redis.get(`refresh:${payload.sub}`);
    if (stored !== token)
        throw new errorHandler_1.AppError(401, "Refresh token revoked or expired");
    const newAccess = signAccess({
        sub: payload.sub,
        role: payload.role,
        email: payload.email,
    });
    const newRefresh = signRefresh({
        sub: payload.sub,
        role: payload.role,
        email: payload.email,
    });
    await storeRefreshToken(payload.sub, newRefresh);
    return { accessToken: newAccess, refreshToken: newRefresh };
}
async function logout(userId) {
    await redis_1.redis.del(`refresh:${userId}`);
}
//# sourceMappingURL=auth.service.js.map