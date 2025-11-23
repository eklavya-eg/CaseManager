import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { prismaClient } from "./db/db";
import { baseRouter } from "./routes/baseRouter";
import redisClient from "./db/redis";
import { logger } from "./middleware/logger";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(logger);
app.use("/api", baseRouter.router);

app.get("/healthy", (req, res) => {
    return res.send("Healthy")
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[${new Date().toISOString()}] UNHANDLED ERROR:`, err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

async function startServer() {
    try {
        await prismaClient.$connect();
        console.log("✅ Database connected");
        app.listen(3000, () => console.log("✅ Server running on port 3000"));
    } catch (error) {
        console.error("❌ Database connection failed", error);
        process.exit(1);
    }
}

process.on("SIGINT", async () => {
    await prismaClient.$disconnect()
    await redisClient.quit();
    console.log("✅ Redis disconnected")
    console.log("✅ Database disconnected")
    console.log("✅ Server is shutted down")
    process.exit(0)
})

startServer()