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
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const mailer_1 = require("../config/mailer");
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const templates = __importStar(require("../emails/templates"));
async function send(to, subject, html) {
    await mailer_1.transporter.sendMail({ from: env_1.env.smtp.from, to, subject, html });
}
exports.emailWorker = new bullmq_1.Worker("emails", async (job) => {
    const data = job.data;
    if (data.type === "JOB_SCHEDULED" && data.to) {
        const tmpl = templates.jobScheduledEmail({
            technicianName: data.technicianName ?? "Technician",
            jobTitle: data.jobTitle,
            scheduledAt: data.scheduledAt,
            cost: data.cost,
        });
        await send(data.to, tmpl.subject, tmpl.html);
    }
    if (data.type === "JOB_ENROUTE" && data.to) {
        const tmpl = templates.jobEnRouteEmail({
            clientName: data.clientName ?? "Client",
            jobTitle: data.jobTitle,
        });
        await send(data.to, tmpl.subject, tmpl.html);
    }
    if (data.type === "JOB_COMPLETED" && data.to) {
        const client = await prisma_1.prisma.client.findFirst({ where: { email: data.to } });
        if (client?.notificationsEnabled === false)
            return;
        const tmpl = templates.jobCompletedEmail({
            clientName: data.clientName ?? "Client",
            jobTitle: data.jobTitle,
        });
        await send(data.to, tmpl.subject, tmpl.html);
    }
    if (data.type === "JOB_CANCELLED") {
        const job_ = await prisma_1.prisma.job.findUnique({
            where: { id: data.jobId },
            include: { client: true, technician: true },
        });
        if (!job_)
            return;
        if (job_.client?.notificationsEnabled !== false) {
            const tmpl = templates.jobCancelledEmail({ recipientName: job_.client.name, jobTitle: data.jobTitle });
            await send(job_.client.email, tmpl.subject, tmpl.html);
        }
        if (job_.technician) {
            const tmpl = templates.jobCancelledEmail({ recipientName: job_.technician.name, jobTitle: data.jobTitle });
            await send(job_.technician.email, tmpl.subject, tmpl.html);
        }
    }
    if (data.type === "JOB_CANCELLED_ADMIN") {
        const job_ = await prisma_1.prisma.job.findUnique({
            where: { id: data.jobId },
            include: { client: true, technician: true },
        });
        if (!job_)
            return;
        if (job_.client?.notificationsEnabled !== false) {
            const tmpl = templates.jobCancelledEmail({ recipientName: job_.client.name, jobTitle: job_.title });
            await send(job_.client.email, tmpl.subject, tmpl.html);
        }
        if (job_.technician) {
            const tmpl = templates.jobCancelledEmail({ recipientName: job_.technician.name, jobTitle: job_.title });
            await send(job_.technician.email, tmpl.subject, tmpl.html);
        }
    }
    if (data.type === "JOB_REQUESTED") {
        const admins = await prisma_1.prisma.admin.findMany({ select: { email: true, name: true } });
        const tmpl = templates.jobRequestedEmail({ jobTitle: data.jobTitle, jobId: data.jobId });
        await Promise.all(admins.map((a) => send(a.email, tmpl.subject, tmpl.html)));
    }
}, { connection: redis_1.redis, concurrency: 5 });
exports.emailWorker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});
//# sourceMappingURL=emailWorker.js.map