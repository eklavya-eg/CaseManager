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
exports.BaseController = void 0;
class BaseController {
    constructor(prismaModel) {
        this.prismaModel = prismaModel;
    }
    findAllWithData() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.findMany();
        });
    }
    findAllWithPagination(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            return yield this.prismaModel.findMany({
                skip,
                take: limit,
                select: {
                    data: false
                }
            });
        });
    }
    findAll(select) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.findMany({
                select: select
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.findUnique({
                where: { id }
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.create({
                data
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.update({
                where: { id },
                data
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prismaModel.delete({
                where: { id }
            });
        });
    }
}
exports.BaseController = BaseController;
