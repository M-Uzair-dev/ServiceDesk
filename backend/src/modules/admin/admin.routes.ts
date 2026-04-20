import { Router } from "express";
import * as ctrl from "./admin.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", ctrl.getDashboard);

// Technicians
router.get("/technicians", ctrl.listTechnicians);
router.post("/technicians", ctrl.createTechnician);
router.get("/technicians/:id", ctrl.getTechnician);
router.put("/technicians/:id", ctrl.updateTechnician);
router.delete("/technicians/:id", ctrl.deleteTechnician);

// Clients
router.get("/clients", ctrl.listClients);
router.post("/clients", ctrl.createClient);
router.get("/clients/:id", ctrl.getClient);
router.put("/clients/:id", ctrl.updateClient);
router.delete("/clients/:id", ctrl.deleteClient);

// Jobs
router.get("/jobs", ctrl.listJobs);
router.get("/jobs/:id", ctrl.getJob);
router.put("/jobs/:id/schedule", ctrl.scheduleJob);
router.put("/jobs/:id/cancel", ctrl.cancelJob);
router.delete("/jobs/:id", ctrl.deleteJob);
router.post("/jobs/:id/notes", ctrl.addNote);

export default router;
