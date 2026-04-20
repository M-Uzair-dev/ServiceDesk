import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
export declare function loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function loginClient(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function loginTechnician(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logoutUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map