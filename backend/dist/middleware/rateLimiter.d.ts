import { Request, Response, NextFunction } from "express";
export declare function slidingWindowRateLimiter(options: {
    windowMs: number;
    max: number;
    keyPrefix?: string;
}): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const defaultLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimiter.d.ts.map