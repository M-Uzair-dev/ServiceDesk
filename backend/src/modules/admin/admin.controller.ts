import { Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "./admin.service";
import { AuthRequest } from "../../types";
import { emailQueue } from "../../queues/emailQueue";
import { JobStatus } from "@prisma/client";

const pageSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const technicianCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
});

const technicianUpdateSchema = technicianCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(),
  status: z.enum(["ACTIVE", "OFFLINE", "SUSPENDED"]).optional(),
  verified: z.boolean().optional(),
});

const clientCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

const scheduleJobSchema = z.object({
  technicianId: z.string(),
  scheduledAt: z.string().datetime(),
  cost: z.number().positive(),
});

// Dashboard

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.getDashboard();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// Technicians

export async function listTechnicians(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = pageSchema.parse(req.query);
    const { data, total } = await svc.listTechnicians(page, limit);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
}

export async function getTechnician(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getTechnician(req.params.id) });
  } catch (err) { next(err); }
}

export async function createTechnician(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = technicianCreateSchema.parse(req.body);
    const tech = await svc.createTechnician(data);
    res.status(201).json({ success: true, data: tech });
  } catch (err) { next(err); }
}

export async function updateTechnician(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = technicianUpdateSchema.parse(req.body);
    res.json({ success: true, data: await svc.updateTechnician(req.params.id, data) });
  } catch (err) { next(err); }
}

export async function deleteTechnician(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteTechnician(req.params.id);
    res.json({ success: true, message: "Technician deleted" });
  } catch (err) { next(err); }
}

// Clients

export async function listClients(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = pageSchema.parse(req.query);
    const { data, total } = await svc.listClients(page, limit);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
}

export async function getClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getClient(req.params.id) });
  } catch (err) { next(err); }
}

export async function createClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = clientCreateSchema.parse(req.body);
    const client = await svc.createClient(data);
    res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
}

export async function updateClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = clientCreateSchema.partial().parse(req.body);
    res.json({ success: true, data: await svc.updateClient(req.params.id, data) });
  } catch (err) { next(err); }
}

export async function deleteClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteClient(req.params.id);
    res.json({ success: true, message: "Client deleted" });
  } catch (err) { next(err); }
}

// Jobs

export async function listJobs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = pageSchema.parse(req.query);
    const status = req.query.status as JobStatus | undefined;
    const { data, total } = await svc.listJobs(page, limit, status);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
}

export async function getJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getJob(req.params.id) });
  } catch (err) { next(err); }
}

export async function scheduleJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = scheduleJobSchema.parse(req.body);
    const job = await svc.scheduleJob(req.params.id, req.user!.sub, data);

    await emailQueue.add("job-scheduled", {
      type: "JOB_SCHEDULED",
      to: job.technician?.email,
      technicianName: job.technician?.name,
      jobTitle: job.title,
      scheduledAt: job.scheduledAt,
      cost: job.cost,
    });

    res.json({ success: true, data: job });
  } catch (err) { next(err); }
}

export async function cancelJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await svc.cancelJobAdmin(req.params.id);
    await emailQueue.add("job-cancelled", { type: "JOB_CANCELLED_ADMIN", jobId: job.id });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
}

export async function deleteJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteJob(req.params.id);
    res.json({ success: true, message: "Job deleted" });
  } catch (err) { next(err); }
}

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { note } = z.object({ note: z.string().min(1) }).parse(req.body);
    const result = await svc.addNote(req.params.id, req.user!.sub, note);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}
