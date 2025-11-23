"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db/db");
const baseRouter_1 = require("./routes/baseRouter");
const redis_1 = __importDefault(require("./db/redis"));
const logger_1 = require("./middleware/logger");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use(logger_1.logger);
app.use("/api", baseRouter_1.baseRouter.router);
app.get("/healthy", (req, res) => {
    return res.send("Healthy");
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] UNHANDLED ERROR:`, err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.prismaClient.$connect();
            console.log("✅ Database connected");
            app.listen(3000, () => console.log("✅ Server running on port 3000"));
        }
        catch (error) {
            console.error("❌ Database connection failed", error);
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.prismaClient.$disconnect();
    yield redis_1.default.quit();
    console.log("✅ Redis disconnected");
    console.log("✅ Database disconnected");
    console.log("✅ Server is shutted down");
    process.exit(0);
}));
startServer();
