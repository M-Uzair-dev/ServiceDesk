export declare function getProfile(id: string): Promise<{
    isWorking: boolean;
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
}>;
export declare function updateProfile(id: string, data: {
    name?: string;
    phoneNumber?: string;
    skills?: string[];
    password?: string;
}): Promise<{
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
}>;
export declare function getMyJobs(technicianId: string, page: number, limit: number): Promise<{
    data: ({
        client: {
            id: string;
            email: string;
            name: string;
            phoneNumber: string | null;
            createdAt: Date;
            updatedAt: Date;
            notificationsEnabled: boolean;
            lastLoginAt: Date | null;
        };
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
    })[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getMyJob(technicianId: string, jobId: string): Promise<{
    client: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        notificationsEnabled: boolean;
        lastLoginAt: Date | null;
    };
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
export declare function updateJobStatus(technicianId: string, jobId: string, action: string): Promise<{
    client: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        notificationsEnabled: boolean;
        lastLoginAt: Date | null;
    };
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
export declare function cancelJob(technicianId: string, jobId: string): Promise<{
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
export declare function addNote(jobId: string, technicianId: string, note: string): Promise<{
    id: string;
    createdAt: Date;
    note: string;
    authorId: string;
    authorRole: string;
    jobId: string;
}>;
export declare function getStats(technicianId: string): Promise<{
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    completionRate: number;
    hoursWorked: number;
    totalReviews: number;
    avgRating: number | null;
}>;
export declare function getReviews(technicianId: string): Promise<({
    client: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        notificationsEnabled: boolean;
        lastLoginAt: Date | null;
    };
    job: {
        title: string;
    };
} & {
    id: string;
    createdAt: Date;
    technicianId: string;
    clientId: string;
    jobId: string;
    stars: number;
    feedback: string;
})[]>;
//# sourceMappingURL=technician.service.d.ts.map