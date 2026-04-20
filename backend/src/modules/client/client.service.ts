import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function getProfile(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    omit: { password: true },
  });
  if (!client) throw new AppError(404, "Client not found");
  return client;
}

export async function updateProfile(id: string, data: {
  name?: string; phoneNumber?: string; notificationsEnabled?: boolean; password?: string;
}) {
  if (data.password) {
    (data as Record<string, unknown>).password = await bcrypt.hash(data.password, 10);
  }
  return prisma.client.update({ where: { id }, data, omit: { password: true } });
}

export async function getMyJobs(clientId: string, page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where: { clientId },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        technician: { omit: { password: true } },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where: { clientId } }),
  ]);
  return { data, total };
}

export async function getMyJob(clientId: string, jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientId },
    include: {
      technician: { omit: { password: true } },
      notes: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!job) throw new AppError(404, "Job not found");
  return job;
}

export async function createJob(clientId: string, data: { title: string; description: string }) {
  return prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      clientId,
      // adminId is null until an admin schedules the job and claims ownership
      status: "REQUESTED",
    },
  });
}

export async function cancelJob(clientId: string, jobId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, clientId } });
  if (!job) throw new AppError(404, "Job not found");

  if (job.status === "ENROUTE" || job.status === "IN_PROGRESS") {
    throw new AppError(400, "Cannot cancel job once technician is en route");
  }
  if (job.status === "COMPLETED" || job.status === "CANCELLED") {
    throw new AppError(400, `Job is already ${job.status.toLowerCase()}`);
  }

  return prisma.job.update({ where: { id: jobId }, data: { status: "CANCELLED" } });
}

export async function createReview(clientId: string, jobId: string, data: { stars: number; feedback: string }) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientId },
    include: { review: true },
  });
  if (!job) throw new AppError(404, "Job not found");
  if (job.status !== "COMPLETED") throw new AppError(400, "Can only review completed jobs");
  if (job.review) throw new AppError(409, "Review already submitted for this job");
  if (!job.technicianId) throw new AppError(400, "No technician assigned to this job");

  if (data.stars < 0 || data.stars > 5) throw new AppError(400, "Stars must be between 0 and 5");

  return prisma.review.create({
    data: {
      stars: data.stars,
      feedback: data.feedback,
      jobId,
      clientId,
      technicianId: job.technicianId,
    },
  });
}
