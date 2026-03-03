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
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
process.env.DATABASE_URL = "postgresql://user:user@localhost:5432/casemanager";
process.env.MONGODB_URI = "mongodb://localhost:27017";
process.env.STATUS_DB = "statuses";
process.env.PREDICTION_DB = "predictions";
process.env.PREDICTION_STATUS_COLLECTION = "prediction_statuses";
process.env.PORT = "3000";
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importStar(require("./db/db"));
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
            (0, db_1.run_migrations)();
            yield (0, db_1.connect_prisma)();
            app.listen(process.env.PORT, () => console.log(`✅ Server running on port ${process.env.PORT}`));
        }
        catch (error) {
            console.error("❌ Database connection failed", error);
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.$disconnect();
    yield redis_1.default.quit();
    console.log("✅ Redis disconnected");
    console.log("✅ Database disconnected");
    console.log("✅ Server is shutted down");
    process.exit(0);
}));
startServer();
