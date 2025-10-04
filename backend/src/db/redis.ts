import { createClient } from "redis";

const redisClient = createClient({url: process.env.REDIS_URL || "redis://localhost:6379/0"})
try {
    redisClient.connect();
} catch (error) {
    console.log("❌ Redis connection failed", error)
}
process.on("SIGINT", async()=>{
    await redisClient.quit();
    process.exit(0)
})
export default redisClient;