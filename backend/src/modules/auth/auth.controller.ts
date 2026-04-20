import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "./auth.service";
import { AuthRequest, Role } from "../../types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password, "ADMIN");
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function loginClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password, "CLIENT");
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function loginTechnician(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password, "TECHNICIAN");
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function refreshTokens(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function logoutUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.sub);
    res.json({ success: true, message: "Logged out" });
  } catch (err) { next(err); }
}
