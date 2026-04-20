import express from "express";
import cors from "cors";
import { defaultLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import clientRoutes from "./modules/client/client.routes";
import technicianRoutes from "./modules/technician/technician.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(defaultLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/technician", technicianRoutes);

app.use(errorHandler);

export default app;
