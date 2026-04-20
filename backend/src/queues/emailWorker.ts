import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { transporter } from "../config/mailer";
import { env } from "../config/env";
import prisma from "../config/prisma";
import * as templates from "../emails/templates";

type EmailJob =
  | { type: "JOB_SCHEDULED"; to?: string; technicianName?: string; jobTitle: string; scheduledAt: Date; cost: number }
  | { type: "JOB_ENROUTE"; to?: string; clientName?: string; jobTitle: string }
  | { type: "JOB_COMPLETED"; to?: string; clientName?: string; jobTitle: string }
  | { type: "JOB_CANCELLED"; jobId: string; jobTitle: string }
  | { type: "JOB_CANCELLED_ADMIN"; jobId: string }
  | { type: "JOB_REQUESTED"; jobId: string; jobTitle: string };

async function send(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

export const emailWorker = new Worker<EmailJob>(
  "emails",
  async (job: Job<EmailJob>) => {
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
      const client = await prisma.client.findFirst({ where: { email: data.to } });
      if (client?.notificationsEnabled === false) return;

      const tmpl = templates.jobCompletedEmail({
        clientName: data.clientName ?? "Client",
        jobTitle: data.jobTitle,
      });
      await send(data.to, tmpl.subject, tmpl.html);
    }

    if (data.type === "JOB_CANCELLED") {
      const job_ = await prisma.job.findUnique({
        where: { id: data.jobId },
        include: { client: true, technician: true },
      });
      if (!job_) return;

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
      const job_ = await prisma.job.findUnique({
        where: { id: data.jobId },
        include: { client: true, technician: true },
      });
      if (!job_) return;

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
      const admins = await prisma.admin.findMany({ select: { email: true, name: true } });
      const tmpl = templates.jobRequestedEmail({ jobTitle: data.jobTitle, jobId: data.jobId });
      await Promise.all(admins.map((a) => send(a.email, tmpl.subject, tmpl.html)));
    }
  },
  { connection: redis, concurrency: 5 }
);

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});
