"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const broker_1 = require("../controllers/broker");
exports.router = (0, express_1.Router)();
exports.router.post("/push", broker_1.brokerController.pushInference);
