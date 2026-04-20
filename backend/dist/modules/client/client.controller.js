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
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getMyJobs = getMyJobs;
exports.getMyJob = getMyJob;
exports.createJob = createJob;
exports.cancelJob = cancelJob;
exports.createReview = createReview;
const zod_1 = require("zod");
const svc = __importStar(require("./client.service"));
const emailQueue_1 = require("../../queues/emailQueue");
const pageSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
async function getProfile(req, res, next) {
    try {
        res.json({ success: true, data: await svc.getProfile(req.user.sub) });
    }
    catch (err) {
        next(err);
    }
}
async function updateProfile(req, res, next) {
    try {
        const data = zod_1.z.object({
            name: zod_1.z.string().min(1).optional(),
            phoneNumber: zod_1.z.string().optional(),
            notificationsEnabled: zod_1.z.boolean().optional(),
            password: zod_1.z.string().min(6).optional(),
        }).parse(req.body);
        res.json({ success: true, data: await svc.updateProfile(req.user.sub, data) });
    }
    catch (err) {
        next(err);
    }
}
async function getMyJobs(req, res, next) {
    try {
        const { page, limit } = pageSchema.parse(req.query);
        res.json({ success: true, data: await svc.getMyJobs(req.user.sub, page, limit) });
    }
    catch (err) {
        next(err);
    }
}
async function getMyJob(req, res, next) {
    try {
        res.json({ success: true, data: await svc.getMyJob(req.user.sub, req.params.id) });
    }
    catch (err) {
        next(err);
    }
}
async function createJob(req, res, next) {
    try {
        const data = zod_1.z.object({
            title: zod_1.z.string().min(1),
            description: zod_1.z.string().min(1),
        }).parse(req.body);
        const job = await svc.createJob(req.user.sub, data);
        await emailQueue_1.emailQueue.add("job-requested", {
            type: "JOB_REQUESTED",
            jobId: job.id,
            jobTitle: job.title,
        });
        res.status(201).json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
}
async function cancelJob(req, res, next) {
    try {
        const job = await svc.cancelJob(req.user.sub, req.params.id);
        await emailQueue_1.emailQueue.add("job-cancelled", {
            type: "JOB_CANCELLED",
            jobId: job.id,
            jobTitle: job.title,
        });
        res.json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
}
async function createReview(req, res, next) {
    try {
        const data = zod_1.z.object({
            stars: zod_1.z.number().min(0).max(5),
            feedback: zod_1.z.string().min(1),
        }).parse(req.body);
        const review = await svc.createReview(req.user.sub, req.params.id, data);
        res.status(201).json({ success: true, data: review });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=client.controller.js.map