import express from "express";
import cors from "cors";
import multer from "multer";
import { prismaClient } from "./db/db";


const app = express();
export const upload = multer({dest:"uploads/"})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get("/healthy", (req, res)=>{
    return res.send("Healthy")
})

try{
    prismaClient.$connect()
    console.log("✅ Database connected")
    app.listen(3000, ()=>{
        console.log("✅ Server is running on port 3000")
    })
} catch {
    console.log("❌ Database connection failed")
}
