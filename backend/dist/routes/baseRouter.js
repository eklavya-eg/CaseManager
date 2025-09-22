"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseRouter = void 0;
const express_1 = require("express");
const model_1 = require("./model");
const data_1 = require("./data");
const broker_1 = require("./broker");
class BaseRouter {
    constructor(router) {
        this.router = router;
        this.router.use("/v1", model_1.router);
        this.router.use("/v1", data_1.router);
        this.router.use("/v1", broker_1.router);
    }
}
exports.baseRouter = new BaseRouter((0, express_1.Router)());
