export declare function getProfile(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
    notificationsEnabled: boolean;
    lastLoginAt: Date | null;
}>;
export declare function updateProfile(id: string, data: {
    name?: string;
    phoneNumber?: string;
    notificationsEnabled?: boolean;
    password?: string;
}): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
    notificationsEnabled: boolean;
    lastLoginAt: Date | null;
}>;
export declare function getMyJobs(clientId: string, page: number, limit: number): Promise<{
    data: ({
        technician: {
            id: string;
            email: string;
            name: string;
            phoneNumber: string | null;
            createdAt: Date;
            updatedAt: Date;
            skills: string[];
            experienceYears: number;
            status: import(".prisma/client").$Enums.TechnicianStatus;
            verified: boolean;
        } | null;
        review: {
            id: string;
            createdAt: Date;
            technicianId: string;
            clientId: string;
            jobId: string;
            stars: number;
            feedback: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        title: string;
        description: string;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        cost: number | null;
        adminId: string | null;
        technicianId: string | null;
        clientId: string;
    })[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getMyJob(clientId: string, jobId: string): Promise<{
    technician: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        skills: string[];
        experienceYears: number;
        status: import(".prisma/client").$Enums.TechnicianStatus;
        verified: boolean;
    } | null;
    notes: {
        id: string;
        createdAt: Date;
        note: string;
        authorId: string;
        authorRole: string;
        jobId: string;
    }[];
    review: {
        id: string;
        createdAt: Date;
        technicianId: string;
        clientId: string;
        jobId: string;
        stars: number;
        feedback: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.JobStatus;
    title: string;
    description: string;
    scheduledAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    cost: number | null;
    adminId: string | null;
    technicianId: string | null;
    clientId: string;
}>;
export declare function createJob(clientId: string, data: {
    title: string;
    description: string;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.JobStatus;
    title: string;
    description: string;
    scheduledAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    cost: number | null;
    adminId: string | null;
    technicianId: string | null;
    clientId: string;
}>;
export declare function cancelJob(clientId: string, jobId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.JobStatus;
    title: string;
    description: string;
    scheduledAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    cost: number | null;
    adminId: string | null;
    technicianId: string | null;
    clientId: string;
}>;
export declare function createReview(clientId: string, jobId: string, data: {
    stars: number;
    feedback: string;
}): Promise<{
    id: string;
    createdAt: Date;
    technicianId: string;
    clientId: string;
    jobId: string;
    stars: number;
    feedback: string;
}>;
//# sourceMappingURL=client.service.d.ts.map