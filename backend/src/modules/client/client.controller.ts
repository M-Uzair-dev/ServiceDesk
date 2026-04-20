import { Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "./client.service";
import { AuthRequest } from "../../types";
import { emailQueue } from "../../queues/emailQueue";

const pageSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getProfile(req.user!.sub) });
  } catch (err) { next(err); }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      name: z.string().min(1).optional(),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      notificationsEnabled: z.boolean().optional(),
      password: z.string().min(6).optional(),
    }).parse(req.body);
    res.json({ success: true, data: await svc.updateProfile(req.user!.sub, data) });
  } catch (err) { next(err); }
}

export async function getMyJobs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = pageSchema.parse(req.query);
    const { data, total } = await svc.getMyJobs(req.user!.sub, page, limit);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
}

export async function getMyJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getMyJob(req.user!.sub, req.params.id) });
  } catch (err) { next(err); }
}

export async function createJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }).parse(req.body);

    const job = await svc.createJob(req.user!.sub, data);

    await emailQueue.add("job-requested", {
      type: "JOB_REQUESTED",
      jobId: job.id,
      jobTitle: job.title,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
}

export async function cancelJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await svc.cancelJob(req.user!.sub, req.params.id);

    await emailQueue.add("job-cancelled", {
      type: "JOB_CANCELLED",
      jobId: job.id,
      jobTitle: job.title,
    });

    res.json({ success: true, data: job });
  } catch (err) { next(err); }
}

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      stars: z.number().min(0).max(5),
      feedback: z.string().min(1),
    }).parse(req.body);

    const review = await svc.createReview(req.user!.sub, req.params.id, data);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}
