"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
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
exports.cancelJob = cancelJob;
exports.deleteJob = deleteJob;
exports.addNote = addNote;
const zod_1 = require("zod");
const svc = __importStar(require("./admin.service"));
const emailQueue_1 = require("../../queues/emailQueue");
const pageSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
const technicianCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phoneNumber: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    experienceYears: zod_1.z.number().optional(),
});
const technicianUpdateSchema = technicianCreateSchema.partial().omit({ password: true }).extend({
    password: zod_1.z.string().min(6).optional(),
    status: zod_1.z.enum(["ACTIVE", "OFFLINE", "SUSPENDED"]).optional(),
    verified: zod_1.z.boolean().optional(),
});
const clientCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phoneNumber: zod_1.z.string().optional(),
});
const scheduleJobSchema = zod_1.z.object({
    technicianId: zod_1.z.string(),
    scheduledAt: zod_1.z.string().datetime(),
    cost: zod_1.z.number().positive(),
});
// Dashboard
async function getDashboard(req, res, next) {
    try {
        const data = await svc.getDashboard();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
// Technicians
async function listTechnicians(req, res, next) {
    try {
        const { page, limit } = pageSchema.parse(req.query);
        res.json({ success: true, data: await svc.listTechnicians(page, limit) });
    }
    catch (err) {
        next(err);
    }
}
async function getTechnician(req, res, next) {
    try {
        res.json({ success: true, data: await svc.getTechnician(req.params.id) });
    }
    catch (err) {
        next(err);
    }
}
async function createTechnician(req, res, next) {
    try {
        const data = technicianCreateSchema.parse(req.body);
        const tech = await svc.createTechnician(data);
        res.status(201).json({ success: true, data: tech });
    }
    catch (err) {
        next(err);
    }
}
async function updateTechnician(req, res, next) {
    try {
        const data = technicianUpdateSchema.parse(req.body);
        res.json({ success: true, data: await svc.updateTechnician(req.params.id, data) });
    }
    catch (err) {
        next(err);
    }
}
async function deleteTechnician(req, res, next) {
    try {
        await svc.deleteTechnician(req.params.id);
        res.json({ success: true, message: "Technician deleted" });
    }
    catch (err) {
        next(err);
    }
}
// Clients
async function listClients(req, res, next) {
    try {
        const { page, limit } = pageSchema.parse(req.query);
        res.json({ success: true, data: await svc.listClients(page, limit) });
    }
    catch (err) {
        next(err);
    }
}
async function getClient(req, res, next) {
    try {
        res.json({ success: true, data: await svc.getClient(req.params.id) });
    }
    catch (err) {
        next(err);
    }
}
async function createClient(req, res, next) {
    try {
        const data = clientCreateSchema.parse(req.body);
        const client = await svc.createClient(data);
        res.status(201).json({ success: true, data: client });
    }
    catch (err) {
        next(err);
    }
}
async function updateClient(req, res, next) {
    try {
        const data = clientCreateSchema.partial().parse(req.body);
        res.json({ success: true, data: await svc.updateClient(req.params.id, data) });
    }
    catch (err) {
        next(err);
    }
}
async function deleteClient(req, res, next) {
    try {
        await svc.deleteClient(req.params.id);
        res.json({ success: true, message: "Client deleted" });
    }
    catch (err) {
        next(err);
    }
}
// Jobs
async function listJobs(req, res, next) {
    try {
        const { page, limit } = pageSchema.parse(req.query);
        const status = req.query.status;
        res.json({ success: true, data: await svc.listJobs(page, limit, status) });
    }
    catch (err) {
        next(err);
    }
}
async function getJob(req, res, next) {
    try {
        res.json({ success: true, data: await svc.getJob(req.params.id) });
    }
    catch (err) {
        next(err);
    }
}
async function scheduleJob(req, res, next) {
    try {
        const data = scheduleJobSchema.parse(req.body);
        const job = await svc.scheduleJob(req.params.id, req.user.sub, data);
        await emailQueue_1.emailQueue.add("job-scheduled", {
            type: "JOB_SCHEDULED",
            to: job.technician?.email,
            technicianName: job.technician?.name,
            jobTitle: job.title,
            scheduledAt: job.scheduledAt,
            cost: job.cost,
        });
        res.json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
}
async function cancelJob(req, res, next) {
    try {
        const job = await svc.cancelJobAdmin(req.params.id);
        await emailQueue_1.emailQueue.add("job-cancelled", { type: "JOB_CANCELLED_ADMIN", jobId: job.id });
        res.json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
}
async function deleteJob(req, res, next) {
    try {
        await svc.deleteJob(req.params.id);
        res.json({ success: true, message: "Job deleted" });
    }
    catch (err) {
        next(err);
    }
}
async function addNote(req, res, next) {
    try {
        const { note } = zod_1.z.object({ note: zod_1.z.string().min(1) }).parse(req.body);
        const result = await svc.addNote(req.params.id, req.user.sub, note);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=admin.controller.js.map