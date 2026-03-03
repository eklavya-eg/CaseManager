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
exports.brokerController = void 0;
const redis_1 = __importDefault(require("../db/redis"));
const broker_1 = require("../schemas/broker");
const db_1 = __importDefault(require("../db/db"));
class BrokerController {
    constructor() {
        this.getModelName = (modelId) => __awaiter(this, void 0, void 0, function* () {
            const modelName = yield db_1.default.model.findUnique({
                select: { name: true },
                where: { id: modelId }
            });
            return (modelName === null || modelName === void 0 ? void 0 : modelName.name) || "";
        });
        this.getDatasetName = (datasetId) => __awaiter(this, void 0, void 0, function* () {
            const datasetName = yield db_1.default.data.findUnique({
                select: { name: true },
                where: { id: datasetId }
            });
            return (datasetName === null || datasetName === void 0 ? void 0 : datasetName.name) || "";
        });
        this.pushInference = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { success, data } = broker_1.pushInferenceSchema.safeParse(req.body);
            if (!success) {
                return res.status(400).json({
                    message: "Wrong Inputs"
                });
            }
            const { modelId, datasetId, accuracy_check, columnName } = data;
            if (accuracy_check === true) {
                if (columnName == undefined) {
                    return res.status(400).json({
                        message: "Wrong Inputs"
                    });
                }
                else {
                    const columns = yield db_1.default.data.findFirst({
                        where: { id: datasetId },
                        select: { columns: true }
                    });
                    if (columns === null || columns.columns.includes(columnName) == false) {
                        return res.status(400).json({
                            message: "Wrong Inputs"
                        });
                    }
                    const re = yield redis_1.default.lPush("predict", JSON.stringify({
                        model_id: modelId,
                        data_id: datasetId,
                        accuracy_check: true,
                        column_name: columnName,
                    }));
                    if (re === 1) {
                        return res.json({ message: "Success" });
                    }
                }
            }
            else {
                const re = yield redis_1.default.lPush("predict", JSON.stringify({
                    model_id: modelId,
                    data_id: datasetId,
                    accuracy_check: false,
                    column_name: null,
                }));
                if (re === 1) {
                    return res.json({ message: "Success" });
                }
            }
            return res.status(500).json({ message: "Internal Server Error" });
        });
    }
}
exports.brokerController = new BrokerController();
