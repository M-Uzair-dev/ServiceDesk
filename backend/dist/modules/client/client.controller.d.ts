import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
export declare function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMyJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMyJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function cancelJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=client.controller.d.ts.map