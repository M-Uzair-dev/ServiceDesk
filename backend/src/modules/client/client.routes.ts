import { Router } from "express";
import * as ctrl from "./client.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
router.use(authenticate, authorize("CLIENT"));

router.get("/me", ctrl.getProfile);
router.put("/me", ctrl.updateProfile);

router.get("/jobs", ctrl.getMyJobs);
router.post("/jobs", ctrl.createJob);
router.get("/jobs/:id", ctrl.getMyJob);
router.put("/jobs/:id/cancel", ctrl.cancelJob);
router.post("/jobs/:id/review", ctrl.createReview);

export default router;
