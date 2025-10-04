import { createClient } from "redis";

const redisClient = createClient({url: process.env.REDIS_URL || "redis://localhost:6379/0"})
try {
    redisClient.connect();
    console.log("✅ Redis connected")
} catch (error) {
    console.log("❌ Redis connection failed", error)
}

export default redisClient;