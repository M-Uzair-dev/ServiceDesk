"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const client_routes_1 = __importDefault(require("./modules/client/client.routes"));
const technician_routes_1 = __importDefault(require("./modules/technician/technician.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rateLimiter_1.defaultLimiter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/client", client_routes_1.default);
app.use("/api/technician", technician_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map