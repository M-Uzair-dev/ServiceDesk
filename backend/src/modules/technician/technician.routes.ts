import { Router } from "express";
import * as ctrl from "./technician.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
router.use(authenticate, authorize("TECHNICIAN"));

router.get("/me", ctrl.getProfile);
router.put("/me", ctrl.updateProfile);
router.get("/stats", ctrl.getStats);
router.get("/reviews", ctrl.getReviews);

router.get("/jobs", ctrl.getMyJobs);
router.get("/jobs/:id", ctrl.getMyJob);
router.put("/jobs/:id/advance", ctrl.updateJobStatus);
router.put("/jobs/:id/cancel", ctrl.cancelJob);
router.post("/jobs/:id/notes", ctrl.addNote);

export default router;
