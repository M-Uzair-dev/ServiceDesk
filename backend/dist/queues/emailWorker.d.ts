import { Worker } from "bullmq";
type EmailJob = {
    type: "JOB_SCHEDULED";
    to?: string;
    technicianName?: string;
    jobTitle: string;
    scheduledAt: Date;
    cost: number;
} | {
    type: "JOB_ENROUTE";
    to?: string;
    clientName?: string;
    jobTitle: string;
} | {
    type: "JOB_COMPLETED";
    to?: string;
    clientName?: string;
    jobTitle: string;
} | {
    type: "JOB_CANCELLED";
    jobId: string;
    jobTitle: string;
} | {
    type: "JOB_CANCELLED_ADMIN";
    jobId: string;
} | {
    type: "JOB_REQUESTED";
    jobId: string;
    jobTitle: string;
};
export declare const emailWorker: Worker<EmailJob, any, string>;
export {};
//# sourceMappingURL=emailWorker.d.ts.map