"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("./db/db");
const baseRouter_1 = require("./routes/baseRouter");
const app = (0, express_1.default)();
exports.upload = (0, multer_1.default)({ dest: "uploads/" });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use("/api", baseRouter_1.baseRouter.router);
app.get("/healthy", (req, res) => {
    return res.send("Healthy");
});
try {
    db_1.prismaClient.$connect();
    console.log("✅ Database connected");
    app.listen(3000, () => {
        console.log("✅ Server is running on port 3000");
    });
}
catch (_a) {
    console.log("❌ Database connection failed");
}
