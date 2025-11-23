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
exports.modelController = void 0;
const db_1 = require("../db/db");
const base_1 = require("./base");
const model_1 = require("../schemas/model");
const promises_1 = __importDefault(require("fs/promises"));
class ModelController extends base_1.BaseController {
    constructor() {
        super(db_1.prismaClient.model);
        this.getModels = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const models = yield this.findAll({
                    id: true,
                    name: true,
                    type: true,
                    createdAt: true
                });
                return res.json(models);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.getModel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const model = yield this.findById(req.params.id);
                return res.json(model);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.postModel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { success, data } = model_1.modelPost.safeParse(req.body);
                if (!success) {
                    return res.status(400).json({ message: "Invalid model data", errors: data });
                }
                if (!req.file) {
                    return res.status(400).json({ message: "No file uploaded" });
                }
                const buffer = yield promises_1.default.readFile(req.file.path);
                const model = yield this.create(Object.assign(Object.assign({}, data), { data: buffer }));
                return res.json({ model });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
        this.deleteModel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const model = yield this.delete(req.params.id);
                return res.json(model);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.modelController = new ModelController();
