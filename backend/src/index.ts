import express from "express";
import { db } from "./db/db";
import cors from "cors";
import multer from "multer";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get("/healthy", (req, res)=>{
    res.send("Healthy")
})

try{
    db.$connect()
    console.log("✅ Database connected")
    app.listen(3000, ()=>{
        console.log("✅ Server is running on port 3000")
    })
} catch {
    console.log("❌ Database connection failed")
}
