"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTechnicians = listTechnicians;
exports.getTechnician = getTechnician;
exports.createTechnician = createTechnician;
exports.updateTechnician = updateTechnician;
exports.deleteTechnician = deleteTechnician;
exports.listClients = listClients;
exports.getClient = getClient;
exports.createClient = createClient;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
exports.listJobs = listJobs;
exports.getJob = getJob;
exports.scheduleJob = scheduleJob;
exports.updateJob = updateJob;
exports.cancelJobAdmin = cancelJobAdmin;
exports.deleteJob = deleteJob;
exports.addNote = addNote;
exports.getDashboard = getDashboard;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
const errorHandler_1 = require("../../middleware/errorHandler");
const CACHE_TTL = 300; // 5 minutes
// ── Technicians ──────────────────────────────────────────────
async function listTechnicians(page, limit) {
    const cacheKey = `cache:technicians:${page}:${limit}`;
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return JSON.parse(cached);
    const [data, total] = await Promise.all([
        prisma_1.prisma.technician.findMany({
            skip: (page - 1) * limit,
            take: limit,
            omit: { password: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.prisma.technician.count(),
    ]);
    const result = { data, total, page, limit };
    await redis_1.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
}
async function getTechnician(id) {
    const tech = await prisma_1.prisma.technician.findUnique({
        where: { id },
        omit: { password: true },
        include: { reviews: true },
    });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    return tech;
}
async function createTechnician(data) {
    const exists = await prisma_1.prisma.technician.findUnique({ where: { email: data.email } });
    if (exists)
        throw new errorHandler_1.AppError(409, "Email already in use");
    const hashed = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.prisma.technician.create({
        data: { ...data, password: hashed },
        omit: { password: true },
    });
}
async function updateTechnician(id, data) {
    const tech = await prisma_1.prisma.technician.findUnique({ where: { id } });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    if (data.password)
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    await redis_1.redis.del(`cache:technicians:*`);
    return prisma_1.prisma.technician.update({
        where: { id },
        data,
        omit: { password: true },
    });
}
async function deleteTechnician(id) {
    const tech = await prisma_1.prisma.technician.findUnique({ where: { id } });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    await prisma_1.prisma.technician.delete({ where: { id } });
}
// ── Clients ──────────────────────────────────────────────────
async function listClients(page, limit) {
    const [data, total] = await Promise.all([
        prisma_1.prisma.client.findMany({
            skip: (page - 1) * limit,
            take: limit,
            omit: { password: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.prisma.client.count(),
    ]);
    return { data, total, page, limit };
}
async function getClient(id) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { id },
        omit: { password: true },
        include: { jobs: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!client)
        throw new errorHandler_1.AppError(404, "Client not found");
    return client;
}
async function createClient(data) {
    const exists = await prisma_1.prisma.client.findUnique({ where: { email: data.email } });
    if (exists)
        throw new errorHandler_1.AppError(409, "Email already in use");
    const hashed = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.prisma.client.create({ data: { ...data, password: hashed }, omit: { password: true } });
}
async function updateClient(id, data) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id } });
    if (!client)
        throw new errorHandler_1.AppError(404, "Client not found");
    if (data.password)
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.prisma.client.update({ where: { id }, data, omit: { password: true } });
}
async function deleteClient(id) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id } });
    if (!client)
        throw new errorHandler_1.AppError(404, "Client not found");
    await prisma_1.prisma.client.delete({ where: { id } });
}
// ── Jobs ─────────────────────────────────────────────────────
async function listJobs(page, limit, status) {
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
        prisma_1.prisma.job.findMany({
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
        prisma_1.prisma.job.count({ where }),
    ]);
    return { data, total, page, limit };
}
async function getJob(id) {
    const job = await prisma_1.prisma.job.findUnique({
        where: { id },
        include: {
            client: { omit: { password: true } },
            technician: { omit: { password: true } },
            admin: { omit: { password: true } },
            notes: { orderBy: { createdAt: "asc" } },
            review: true,
        },
    });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return job;
}
async function scheduleJob(jobId, adminId, data) {
    const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    if (job.status !== "REQUESTED")
        throw new errorHandler_1.AppError(400, "Only REQUESTED jobs can be scheduled");
    const tech = await prisma_1.prisma.technician.findUnique({ where: { id: data.technicianId } });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    if (tech.status !== "ACTIVE")
        throw new errorHandler_1.AppError(400, "Technician is not active");
    const updated = await prisma_1.prisma.job.update({
        where: { id: jobId },
        data: {
            adminId,
            technicianId: data.technicianId,
            scheduledAt: new Date(data.scheduledAt),
            cost: data.cost,
            status: "SCHEDULED",
        },
        include: { technician: { omit: { password: true } }, client: { omit: { password: true } } },
    });
    await prisma_1.prisma.admin.update({ where: { id: adminId }, data: { totalBookings: { increment: 1 } } });
    return updated;
}
async function updateJob(id, data) {
    const job = await prisma_1.prisma.job.findUnique({ where: { id } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return prisma_1.prisma.job.update({ where: { id }, data });
}
async function cancelJobAdmin(id) {
    const job = await prisma_1.prisma.job.findUnique({ where: { id } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    if (job.status === "COMPLETED")
        throw new errorHandler_1.AppError(400, "Cannot cancel a completed job");
    return prisma_1.prisma.job.update({ where: { id }, data: { status: "CANCELLED" } });
}
async function deleteJob(id) {
    const job = await prisma_1.prisma.job.findUnique({ where: { id } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    await prisma_1.prisma.job.delete({ where: { id } });
}
// ── Notes ────────────────────────────────────────────────────
async function addNote(jobId, authorId, note) {
    const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return prisma_1.prisma.note.create({ data: { jobId, authorId, note, authorRole: "ADMIN" } });
}
// ── Analytics ────────────────────────────────────────────────
async function getDashboard() {
    const cacheKey = "cache:dashboard";
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return JSON.parse(cached);
    const [totalClients, totalTechnicians, totalJobs, jobsByStatus, recentJobs, topTechnicians,] = await Promise.all([
        prisma_1.prisma.client.count(),
        prisma_1.prisma.technician.count(),
        prisma_1.prisma.job.count(),
        prisma_1.prisma.job.groupBy({ by: ["status"], _count: { status: true } }),
        prisma_1.prisma.job.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { client: { omit: { password: true } }, technician: { omit: { password: true } } },
        }),
        prisma_1.prisma.technician.findMany({
            take: 5,
            omit: { password: true },
            include: { _count: { select: { jobs: true } } },
            orderBy: { jobs: { _count: "desc" } },
        }),
    ]);
    const totalRevenue = await prisma_1.prisma.job.aggregate({
        _sum: { cost: true },
        where: { status: "COMPLETED" },
    });
    const result = {
        totalClients,
        totalTechnicians,
        totalJobs,
        totalRevenue: totalRevenue._sum.cost ?? 0,
        jobsByStatus: Object.fromEntries(jobsByStatus.map((j) => [j.status, j._count.status])),
        recentJobs,
        topTechnicians,
    };
    await redis_1.redis.setex(cacheKey, 60, JSON.stringify(result));
    return result;
}
//# sourceMappingURL=admin.service.js.map