"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL || "redis://localhost:6379/0" });
try {
    redisClient.connect();
    console.log("✅ Redis connected");
}
catch (error) {
    console.log("❌ Redis connection failed", error);
}
exports.default = redisClient;
