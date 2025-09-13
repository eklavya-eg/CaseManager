import { Request, Response } from "express";
import redisClient from "../db/redis";

export const postData = async (req: Request, res: Response)=>{
    const file = req.file;
    if(!file){return res.status(403).json({message: "Invalid Inputs"})};
    const re = await redisClient.lPush()
}