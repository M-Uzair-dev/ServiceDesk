import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { redis } from "../../config/redis";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { JwtPayload, Role } from "../../types";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function signAccess(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

function signRefresh(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await redis.setex(`refresh:${userId}`, REFRESH_TTL_SECONDS, token);
}

async function findUserByRole(email: string, role: Role) {
  if (role === "ADMIN") return prisma.admin.findUnique({ where: { email } });
  if (role === "CLIENT") return prisma.client.findUnique({ where: { email } });
  if (role === "TECHNICIAN")
    return prisma.technician.findUnique({ where: { email } });
}

export async function login(email: string, password: string, role: Role) {
  const user = await findUserByRole(email, role);
  if (!user) throw new AppError(401, "Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, "Invalid credentials");

  if (role === "TECHNICIAN") {
    const tech = user as { status: string };
    if (tech.status === "SUSPENDED")
      throw new AppError(403, "Account suspended");
  }

  const payload: JwtPayload = { sub: user.id, role, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await storeRefreshToken(user.id, refreshToken);

  if (role === "CLIENT") {
    await prisma.client.update({
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

export async function refresh(token: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await redis.get(`refresh:${payload.sub}`);
  if (stored !== token)
    throw new AppError(401, "Refresh token revoked or expired");

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

export async function logout(userId: string): Promise<void> {
  await redis.del(`refresh:${userId}`);
}
