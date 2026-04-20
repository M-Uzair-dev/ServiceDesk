import { Router } from "express";
import * as ctrl from "./auth.controller";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/admin/login", authLimiter, ctrl.loginAdmin);
router.post("/client/login", authLimiter, ctrl.loginClient);
router.post("/technician/login", authLimiter, ctrl.loginTechnician);
router.post("/refresh", ctrl.refreshTokens);
router.post("/logout", authenticate, ctrl.logoutUser);

export default router;
