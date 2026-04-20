import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "../types";
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function authorize(...roles: Role[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map