import { createClient } from "redis";

const redisClient = createClient()
redisClient.connect();
process.on("SIGINT", async()=>{
    await redisClient.quit();
    process.exit(0)
})
export default redisClient;