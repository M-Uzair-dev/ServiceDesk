"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getMyJobs = getMyJobs;
exports.getMyJob = getMyJob;
exports.updateJobStatus = updateJobStatus;
exports.cancelJob = cancelJob;
exports.addNote = addNote;
exports.getStats = getStats;
exports.getReviews = getReviews;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const VALID_TRANSITIONS = {
    SCHEDULED: "ENROUTE",
    ENROUTE: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
};
async function getProfile(id) {
    const tech = await prisma_1.prisma.technician.findUnique({
        where: { id },
        omit: { password: true },
    });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    const isWorking = await computeIsWorking(id);
    return { ...tech, isWorking };
}
async function updateProfile(id, data) {
    if (data.password) {
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    }
    return prisma_1.prisma.technician.update({ where: { id }, data, omit: { password: true } });
}
async function getMyJobs(technicianId, page, limit) {
    const [data, total] = await Promise.all([
        prisma_1.prisma.job.findMany({
            where: { technicianId },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                client: { omit: { password: true } },
                notes: { orderBy: { createdAt: "asc" } },
                review: true,
            },
            orderBy: { scheduledAt: "asc" },
        }),
        prisma_1.prisma.job.count({ where: { technicianId } }),
    ]);
    return { data, total, page, limit };
}
async function getMyJob(technicianId, jobId) {
    const job = await prisma_1.prisma.job.findFirst({
        where: { id: jobId, technicianId },
        include: {
            client: { omit: { password: true } },
            notes: { orderBy: { createdAt: "asc" } },
            review: true,
        },
    });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return job;
}
async function updateJobStatus(technicianId, jobId, action) {
    const job = await prisma_1.prisma.job.findFirst({ where: { id: jobId, technicianId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    const nextStatus = VALID_TRANSITIONS[job.status];
    if (!nextStatus)
        throw new errorHandler_1.AppError(400, `Cannot advance job from ${job.status}`);
    const updateData = { status: nextStatus };
    if (nextStatus === "IN_PROGRESS")
        updateData.startedAt = new Date();
    if (nextStatus === "COMPLETED")
        updateData.completedAt = new Date();
    return prisma_1.prisma.job.update({
        where: { id: jobId },
        data: updateData,
        include: { client: { omit: { password: true } } },
    });
}
async function cancelJob(technicianId, jobId) {
    const job = await prisma_1.prisma.job.findFirst({ where: { id: jobId, technicianId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    if (job.status === "COMPLETED" || job.status === "CANCELLED") {
        throw new errorHandler_1.AppError(400, `Job is already ${job.status.toLowerCase()}`);
    }
    return prisma_1.prisma.job.update({ where: { id: jobId }, data: { status: "CANCELLED" } });
}
async function addNote(jobId, technicianId, note) {
    const job = await prisma_1.prisma.job.findFirst({ where: { id: jobId, technicianId } });
    if (!job)
        throw new errorHandler_1.AppError(404, "Job not found");
    return prisma_1.prisma.note.create({ data: { jobId, authorId: technicianId, note, authorRole: "TECHNICIAN" } });
}
async function getStats(technicianId) {
    const tech = await prisma_1.prisma.technician.findUnique({ where: { id: technicianId } });
    if (!tech)
        throw new errorHandler_1.AppError(404, "Technician not found");
    const [totalJobs, completedJobs, cancelledJobs, reviews] = await Promise.all([
        prisma_1.prisma.job.count({ where: { technicianId } }),
        prisma_1.prisma.job.count({ where: { technicianId, status: "COMPLETED" } }),
        prisma_1.prisma.job.count({ where: { technicianId, status: "CANCELLED" } }),
        prisma_1.prisma.review.findMany({ where: { technicianId } }),
    ]);
    // compute hours worked from startedAt → completedAt
    const completedWithTimes = await prisma_1.prisma.job.findMany({
        where: { technicianId, status: "COMPLETED", startedAt: { not: null }, completedAt: { not: null } },
        select: { startedAt: true, completedAt: true },
    });
    const totalHours = completedWithTimes.reduce((acc, job) => {
        const ms = job.completedAt.getTime() - job.startedAt.getTime();
        return acc + ms / 3600000;
    }, 0);
    const avgRating = reviews.length
        ? reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length
        : null;
    return {
        totalJobs,
        completedJobs,
        cancelledJobs,
        completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
        hoursWorked: Math.round(totalHours * 10) / 10,
        totalReviews: reviews.length,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    };
}
async function getReviews(technicianId) {
    return prisma_1.prisma.review.findMany({
        where: { technicianId },
        include: { client: { omit: { password: true } }, job: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
    });
}
async function computeIsWorking(technicianId) {
    const activeJob = await prisma_1.prisma.job.findFirst({
        where: {
            technicianId,
            status: { in: ["ENROUTE", "IN_PROGRESS"] },
        },
    });
    return !!activeJob;
}
//# sourceMappingURL=technician.service.js.map