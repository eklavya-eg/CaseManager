"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelPost = void 0;
const zod_1 = __importDefault(require("zod"));
exports.modelPost = zod_1.default.object({
    name: zod_1.default.string().min(5).refine(v => v.endsWith(".pkl") || v.endsWith(".cb"), { message: "Must ends with model extensions" }),
    type: zod_1.default.enum(["CLASSIFICATION", "ANOMALY_DETECTION"]),
});
