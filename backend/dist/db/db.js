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
exports.run_migrations = exports.connect_prisma = void 0;
const client_1 = require("@prisma/client");
const child_process_1 = require("child_process");
const prismaClient = new client_1.PrismaClient();
const connect_prisma = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient.$connect();
    console.log("✅ Database connected");
});
exports.connect_prisma = connect_prisma;
const run_migrations = () => {
    console.log("Running migrations if any...");
    (0, child_process_1.execSync)("npx prisma migrate deploy", { stdio: "inherit" });
};
exports.run_migrations = run_migrations;
exports.default = prismaClient;
