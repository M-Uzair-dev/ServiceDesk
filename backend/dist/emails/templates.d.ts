export declare function jobScheduledEmail(data: {
    technicianName: string;
    jobTitle: string;
    scheduledAt: Date | string;
    cost: number;
}): {
    subject: string;
    html: string;
};
export declare function jobEnRouteEmail(data: {
    clientName: string;
    jobTitle: string;
}): {
    subject: string;
    html: string;
};
export declare function jobCompletedEmail(data: {
    clientName: string;
    jobTitle: string;
}): {
    subject: string;
    html: string;
};
export declare function jobCancelledEmail(data: {
    recipientName: string;
    jobTitle: string;
}): {
    subject: string;
    html: string;
};
export declare function jobRequestedEmail(data: {
    jobTitle: string;
    jobId: string;
}): {
    subject: string;
    html: string;
};
//# sourceMappingURL=templates.d.ts.map