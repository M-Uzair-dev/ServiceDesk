import { Request } from "express";
export type Role = "ADMIN" | "CLIENT" | "TECHNICIAN";
export interface JwtPayload {
    sub: string;
    role: Role;
    email: string;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map