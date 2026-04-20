"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ctrl = __importStar(require("./admin.controller"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)("ADMIN"));
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
exports.default = router;
//# sourceMappingURL=admin.routes.js.map