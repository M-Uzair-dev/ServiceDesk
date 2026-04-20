import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { JobStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<string, JobStatus> = {
  SCHEDULED: "ENROUTE",
  ENROUTE: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

export async function getProfile(id: string) {
  const tech = await prisma.technician.findUnique({
    where: { id },
    omit: { password: true },
  });
  if (!tech) throw new AppError(404, "Technician not found");

  const isWorking = await computeIsWorking(id);
  return { ...tech, isWorking };
}

export async function updateProfile(id: string, data: {
  name?: string; phoneNumber?: string; skills?: string[]; password?: string;
}) {
  if (data.password) {
    (data as Record<string, unknown>).password = await bcrypt.hash(data.password, 10);
  }
  return prisma.technician.update({ where: { id }, data, omit: { password: true } });
}

export async function getMyJobs(technicianId: string, page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.job.findMany({
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
    prisma.job.count({ where: { technicianId } }),
  ]);
  return { data, total };
}

export async function getMyJob(technicianId: string, jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, technicianId },
    include: {
      client: { omit: { password: true } },
      notes: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!job) throw new AppError(404, "Job not found");
  return job;
}

export async function updateJobStatus(technicianId: string, jobId: string, action: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, technicianId } });
  if (!job) throw new AppError(404, "Job not found");

  const nextStatus = VALID_TRANSITIONS[job.status];
  if (!nextStatus) throw new AppError(400, `Cannot advance job from ${job.status}`);

  const updateData: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === "IN_PROGRESS") updateData.startedAt = new Date();
  if (nextStatus === "COMPLETED") updateData.completedAt = new Date();

  return prisma.job.update({
    where: { id: jobId },
    data: updateData,
    include: { client: { omit: { password: true } } },
  });
}

export async function cancelJob(technicianId: string, jobId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, technicianId } });
  if (!job) throw new AppError(404, "Job not found");
  if (job.status === "COMPLETED" || job.status === "CANCELLED") {
    throw new AppError(400, `Job is already ${job.status.toLowerCase()}`);
  }
  return prisma.job.update({ where: { id: jobId }, data: { status: "CANCELLED" } });
}

export async function addNote(jobId: string, technicianId: string, note: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, technicianId } });
  if (!job) throw new AppError(404, "Job not found");
  return prisma.note.create({ data: { jobId, authorId: technicianId, note, authorRole: "TECHNICIAN" } });
}

export async function getStats(technicianId: string) {
  const tech = await prisma.technician.findUnique({ where: { id: technicianId } });
  if (!tech) throw new AppError(404, "Technician not found");

  const [totalJobs, completedJobs, cancelledJobs, reviews] = await Promise.all([
    prisma.job.count({ where: { technicianId } }),
    prisma.job.count({ where: { technicianId, status: "COMPLETED" } }),
    prisma.job.count({ where: { technicianId, status: "CANCELLED" } }),
    prisma.review.findMany({ where: { technicianId } }),
  ]);

  // compute hours worked from startedAt → completedAt
  const completedWithTimes = await prisma.job.findMany({
    where: { technicianId, status: "COMPLETED", startedAt: { not: null }, completedAt: { not: null } },
    select: { startedAt: true, completedAt: true },
  });

  const totalHours = completedWithTimes.reduce((acc, job) => {
    const ms = job.completedAt!.getTime() - job.startedAt!.getTime();
    return acc + ms / 3_600_000;
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

export async function getReviews(technicianId: string) {
  return prisma.review.findMany({
    where: { technicianId },
    include: { client: { omit: { password: true } }, job: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function computeIsWorking(technicianId: string): Promise<boolean> {
  const activeJob = await prisma.job.findFirst({
    where: {
      technicianId,
      status: { in: ["ENROUTE", "IN_PROGRESS"] },
    },
  });
  return !!activeJob;
}
