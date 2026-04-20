"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getMyJobs = getMyJobs;
exports.getMyJob = getMyJob;
exports.createJob = createJob;
exports.cancelJob = cancelJob;
exports.createReview = createReview;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getProfile(id) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { id },
        omit: { password: true },
    });
    if (!client)
        throw new errorHandler_1.AppError(404, "Client not found");
    return client;
}
async function updateProfile(id, data) {
    if (data.password) {
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    }
    return prisma_1.prisma.client.update({ where: { id }, data, omit: { password: true } });
}
async function getMyJobs(clientId, page, limit) {
    const [data, total] = await Promise.all([
        prisma_1.prisma.job.findMany({
            where: { clientId },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                technician: { omit: { password: true } },
                review: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.prisma.job.count({ where: { clientId } }),
    ]);
    return { data, total, page, limit };
}
async function getMyJob(clientId, jobId) {
    const job = await prisma_1.prisma.job.findFirst({
        where: { id: jobId, clientId },
        include: {
            technician: { omit: { password: true } },
            notes: { orderBy: { createdAt: "asc" } },
            review: true,
        },
    });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return job;
}
async function createJob(clientId, data) {
    return prisma_1.prisma.job.create({
        data: {
            title: data.title,
            description: data.description,
            clientId,
            // adminId is null until an admin schedules the job and claims ownership
            status: "REQUESTED",
        },
    });
}
async function cancelJob(clientId, jobId) {
    const job = await prisma_1.prisma.job.findFirst({ where: { id: jobId, clientId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    if (job.status === "ENROUTE" || job.status === "IN_PROGRESS") {
        throw new errorHandler_1.AppError(400, "Cannot cancel job once technician is en route");
    }
    if (job.status === "COMPLETED" || job.status === "CANCELLED") {
        throw new errorHandler_1.AppError(400, `Job is already ${job.status.toLowerCase()}`);
    }
    return prisma_1.prisma.job.update({ where: { id: jobId }, data: { status: "CANCELLED" } });
}
async function createReview(clientId, jobId, data) {
    const job = await prisma_1.prisma.job.findFirst({
        where: { id: jobId, clientId },
        include: { review: true },
    });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    if (job.status !== "COMPLETED")
        throw new errorHandler_1.AppError(400, "Can only review completed jobs");
    if (job.review)
        throw new errorHandler_1.AppError(409, "Review already submitted for this job");
    if (!job.technicianId)
        throw new errorHandler_1.AppError(400, "No technician assigned to this job");
    if (data.stars < 0 || data.stars > 5)
        throw new errorHandler_1.AppError(400, "Stars must be between 0 and 5");
    return prisma_1.prisma.review.create({
        data: {
            stars: data.stars,
            feedback: data.feedback,
            jobId,
            clientId,
            technicianId: job.technicianId,
        },
    });
}
//# sourceMappingURL=client.service.js.map