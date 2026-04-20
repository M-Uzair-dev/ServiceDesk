import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
export declare function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMyJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMyJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateJobStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function cancelJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function addNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=technician.controller.d.ts.map