import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prismaClient = new PrismaClient();

export const connect_prisma = async () => {
    await prismaClient.$connect();
    console.log("✅ Database connected")
}

export const run_migrations = () => {
    console.log("Running migrations if any...")
    execSync("npx prisma migrate deploy", {stdio: "inherit"})
}

export default prismaClient;