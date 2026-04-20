"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: "Validation failed",
            details: err.flatten().fieldErrors,
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    console.error("[Unhandled Error]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
}
//# sourceMappingURL=errorHandler.js.map