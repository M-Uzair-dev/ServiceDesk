import { JobStatus } from "@prisma/client";
export declare function listTechnicians(page: number, limit: number): Promise<any>;
export declare function getTechnician(id: string): Promise<{
    reviews: {
        id: string;
        createdAt: Date;
        technicianId: string;
        clientId: string;
        jobId: string;
        stars: number;
        feedback: string;
    }[];
} & {
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
export declare function createTechnician(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    skills?: string[];
    experienceYears?: number;
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
export declare function updateTechnician(id: string, data: Record<string, unknown>): Promise<{
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
export declare function deleteTechnician(id: string): Promise<void>;
export declare function listClients(page: number, limit: number): Promise<{
    data: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
        notificationsEnabled: boolean;
        lastLoginAt: Date | null;
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getClient(id: string): Promise<{
    jobs: {
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
    }[];
} & {
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
    notificationsEnabled: boolean;
    lastLoginAt: Date | null;
}>;
export declare function createClient(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
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
export declare function updateClient(id: string, data: Record<string, unknown>): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
    notificationsEnabled: boolean;
    lastLoginAt: Date | null;
}>;
export declare function deleteClient(id: string): Promise<void>;
export declare function listJobs(page: number, limit: number, status?: JobStatus): Promise<{
    data: ({
        admin: {
            id: string;
            email: string;
            name: string;
            phoneNumber: string | null;
            address: string | null;
            preferredContactMethod: import(".prisma/client").$Enums.ContactMethod;
            totalBookings: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
export declare function getJob(id: string): Promise<{
    admin: {
        id: string;
        email: string;
        name: string;
        phoneNumber: string | null;
        address: string | null;
        preferredContactMethod: import(".prisma/client").$Enums.ContactMethod;
        totalBookings: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
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
export declare function scheduleJob(jobId: string, adminId: string, data: {
    technicianId: string;
    scheduledAt: string;
    cost: number;
}): Promise<{
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
export declare function updateJob(id: string, data: Record<string, unknown>): Promise<{
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
export declare function cancelJobAdmin(id: string): Promise<{
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
export declare function deleteJob(id: string): Promise<void>;
export declare function addNote(jobId: string, authorId: string, note: string): Promise<{
    id: string;
    createdAt: Date;
    note: string;
    authorId: string;
    authorRole: string;
    jobId: string;
}>;
export declare function getDashboard(): Promise<any>;
//# sourceMappingURL=admin.service.d.ts.map