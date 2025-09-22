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
exports.modelController = void 0;
const db_1 = require("../db/db");
const base_1 = require("./base");
const model_1 = require("../schemas/model");
class ModelController extends base_1.BaseController {
    constructor() {
        super(db_1.prismaClient.model);
    }
    getModels(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const models = yield this.findAll();
                return res.json(models);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    getModel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const model = yield this.findById(req.params.id);
                return res.json(model);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    postModel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { success, data } = model_1.modelPost.safeParse(req.body);
                if (!success && !req.file) {
                    return res.status(400).json({ message: "Wrong Inputs" });
                }
                const model = yield this.create(Object.assign(Object.assign({}, data), { data: (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer }));
                return res.json(model);
            }
            catch (error) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    deleteModel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
