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
exports.dataController = void 0;
const db_1 = require("../db/db");
const data_1 = require("../schemas/data");
const base_1 = require("./base");
const promises_1 = __importDefault(require("fs/promises"));
class DataController extends base_1.BaseController {
    constructor() {
        super(db_1.prismaClient.data);
        this.getDatasets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const datasets = yield this.findAll({
                    id: true,
                    name: true,
                    uploadedAt: true
                });
                return res.json(datasets);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.getDataset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const dataset = yield this.findById(req.params.id);
                return res.json(dataset);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.postDataset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { success, data } = data_1.datasetPost.safeParse(req.body);
                if (!success) {
                    return res.status(400).json({ message: "Invalid dataset data", errors: data });
                }
                if (!req.file) {
                    return res.status(400).json({ message: "No file uploaded" });
                }
                const buffer = yield promises_1.default.readFile(req.file.path);
                const dataset = yield this.create(Object.assign(Object.assign({}, data), { data: buffer }));
                return res.json({ dataset });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.deleteDataset = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
