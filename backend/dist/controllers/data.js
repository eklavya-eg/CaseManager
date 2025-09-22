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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataController = void 0;
const db_1 = require("../db/db");
const data_1 = require("../schemas/data");
const base_1 = require("./base");
class DataController extends base_1.BaseController {
    constructor() {
        super(db_1.prismaClient.data);
    }
    getDatasets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datasets = yield this.findAll();
                return res.json(datasets);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    getDataset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataset = yield this.findById(req.params.id);
                return res.json(dataset);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    postDataset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { success, data } = data_1.datasetPost.safeParse(req.body);
                if (!success && !req.file) {
                    return res.status(400).json({ message: "Wrong Inputs" });
                }
                const dataset = yield this.create(Object.assign(Object.assign({}, data), { data: (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer }));
                return res.json(dataset);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    deleteDataset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataset = yield this.delete(req.params.id);
                return res.json(dataset);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.dataController = new DataController();
