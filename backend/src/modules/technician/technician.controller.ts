import { Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "./technician.service";
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
      skills: z.array(z.string()).optional(),
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

export async function updateJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await svc.updateJobStatus(req.user!.sub, req.params.id, "advance");

    if (job.status === "ENROUTE") {
      await emailQueue.add("job-enroute", {
        type: "JOB_ENROUTE",
        to: job.client?.email,
        clientName: job.client?.name,
        jobTitle: job.title,
      });
    }

    if (job.status === "COMPLETED") {
      await emailQueue.add("job-completed", {
        type: "JOB_COMPLETED",
        to: job.client?.email,
        clientName: job.client?.name,
        jobTitle: job.title,
      });
    }

    res.json({ success: true, data: job });
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

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { note } = z.object({ note: z.string().min(1) }).parse(req.body);
    const result = await svc.addNote(req.params.id, req.user!.sub, note);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getStats(req.user!.sub) });
  } catch (err) { next(err); }
}

export async function getReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getReviews(req.user!.sub) });
  } catch (err) { next(err); }
}
