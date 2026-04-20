import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { redis } from "../../config/redis";
import { AppError } from "../../middleware/errorHandler";
import { JobStatus } from "@prisma/client";

const CACHE_TTL = 300; // 5 minutes

async function cacheGet(key: string): Promise<string | null> {
  try { return await redis.get(key); } catch { return null; }
}

async function cacheSet(key: string, ttl: number, value: string): Promise<void> {
  try { await redis.setex(key, ttl, value); } catch { /* Redis unavailable, skip caching */ }
}

async function cacheDel(...keys: string[]): Promise<void> {
  try { if (keys.length) await redis.del(...keys); } catch { /* ignore */ }
}

// ── Technicians ──────────────────────────────────────────────

export async function listTechnicians(page: number, limit: number) {
  const cacheKey = `cache:technicians:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const [data, total] = await Promise.all([
    prisma.technician.findMany({
      skip: (page - 1) * limit,
      take: limit,
      omit: { password: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.technician.count(),
  ]);

  const result = { data, total };
  await cacheSet(cacheKey, CACHE_TTL, JSON.stringify(result));
  return result;
}

export async function getTechnician(id: string) {
  const tech = await prisma.technician.findUnique({
    where: { id },
    omit: { password: true },
    include: { reviews: true },
  });
  if (!tech) throw new AppError(404, "Technician not found");
  return tech;
}

export async function createTechnician(data: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  skills?: string[];
  experienceYears?: number;
}) {
  const exists = await prisma.technician.findUnique({
    where: { email: data.email },
  });
  if (exists) throw new AppError(409, "Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.technician.create({
    data: { ...data, password: hashed },
    omit: { password: true },
  });
}

export async function updateTechnician(
  id: string,
  data: Record<string, unknown>,
) {
  const tech = await prisma.technician.findUnique({ where: { id } });
  if (!tech) throw new AppError(404, "Technician not found");

  if (data.password)
    data.password = await bcrypt.hash(data.password as string, 10);

  await cacheDel(`cache:technicians:*`, "cache:dashboard");
  return prisma.technician.update({
    where: { id },
    data,
    omit: { password: true },
  });
}

export async function deleteTechnician(id: string) {
  const tech = await prisma.technician.findUnique({ where: { id } });
  if (!tech) throw new AppError(404, "Technician not found");
  await prisma.technician.delete({ where: { id } });
}

// ── Clients ──────────────────────────────────────────────────

export async function listClients(page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.client.findMany({
      skip: (page - 1) * limit,
      take: limit,
      omit: { password: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
  ]);
  return { data, total };
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    omit: { password: true },
    include: { jobs: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!client) throw new AppError(404, "Client not found");
  return client;
}

export async function createClient(data: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}) {
  const exists = await prisma.client.findUnique({
    where: { email: data.email },
  });
  if (exists) throw new AppError(409, "Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const client = await prisma.client.create({
    data: { ...data, password: hashed },
    omit: { password: true },
  });
  await cacheDel("cache:dashboard");
  return client;
}

export async function updateClient(id: string, data: Record<string, unknown>) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new AppError(404, "Client not found");
  if (data.password)
    data.password = await bcrypt.hash(data.password as string, 10);
  return prisma.client.update({
    where: { id },
    data,
    omit: { password: true },
  });
}

export async function deleteClient(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new AppError(404, "Client not found");
  await prisma.client.delete({ where: { id } });
}

// ── Jobs ─────────────────────────────────────────────────────

export async function listJobs(
  page: number,
  limit: number,
  status?: JobStatus,
) {
  const where = status ? { status } : {};
  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        client: { omit: { password: true } },
        technician: { omit: { password: true } },
        admin: { omit: { password: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);
  return { data, total };
}

export async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: { omit: { password: true } },
      technician: { omit: { password: true } },
      admin: { omit: { password: true } },
      notes: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!job) throw new AppError(404, "Job not found");
  return job;
}

export async function scheduleJob(
  jobId: string,
  adminId: string,
  data: { technicianId: string; scheduledAt: string; cost: number },
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError(404, "Job not found");
  if (job.status !== "REQUESTED")
    throw new AppError(400, "Only REQUESTED jobs can be scheduled");

  const tech = await prisma.technician.findUnique({
    where: { id: data.technicianId },
  });
  if (!tech) throw new AppError(404, "Technician not found");
  if (tech.status !== "ACTIVE")
    throw new AppError(400, "Technician is not active");

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      adminId,
      technicianId: data.technicianId,
      scheduledAt: new Date(data.scheduledAt),
      cost: data.cost,
      status: "SCHEDULED",
    },
    include: {
      technician: { omit: { password: true } },
      client: { omit: { password: true } },
    },
  });

  await prisma.admin.update({
    where: { id: adminId },
    data: { totalBookings: { increment: 1 } },
  });
  return updated;
}

export async function updateJob(id: string, data: Record<string, unknown>) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(404, "Job not found");
  return prisma.job.update({ where: { id }, data });
}

export async function cancelJobAdmin(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(404, "Job not found");
  if (job.status === "COMPLETED")
    throw new AppError(400, "Cannot cancel a completed job");

  return prisma.job.update({ where: { id }, data: { status: "CANCELLED" } });
}

export async function deleteJob(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(404, "Job not found");
  await prisma.job.delete({ where: { id } });
}

// ── Notes ────────────────────────────────────────────────────

export async function addNote(jobId: string, authorId: string, note: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError(404, "Job not found");
  return prisma.note.create({
    data: { jobId, authorId, note, authorRole: "ADMIN" },
  });
}

// ── Analytics ────────────────────────────────────────────────

export async function getDashboard() {
  const cacheKey = "cache:dashboard";
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const [
    totalClients,
    totalTechnicians,
    totalJobs,
    jobsByStatus,
    recentJobs,
    topTechnicians,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.technician.count(),
    prisma.job.count(),
    prisma.job.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: { omit: { password: true } },
        technician: { omit: { password: true } },
      },
    }),
    prisma.technician.findMany({
      take: 5,
      omit: { password: true },
      include: { _count: { select: { jobs: true } } },
      orderBy: { jobs: { _count: "desc" } },
    }),
  ]);

  const totalRevenue = await prisma.job.aggregate({
    _sum: { cost: true },
    where: { status: "COMPLETED" },
  });

  const result = {
    totalClients,
    totalTechnicians,
    totalJobs,
    totalRevenue: totalRevenue._sum.cost ?? 0,
    jobsByStatus: Object.fromEntries(
      jobsByStatus.map((j: any) => [j.status, j._count.status]),
    ),
    recentJobs,
    topTechnicians,
  };

  await cacheSet(cacheKey, 60, JSON.stringify(result));
  return result;
}
