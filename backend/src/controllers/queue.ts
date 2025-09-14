import { Request, Response } from "express";
import redisClient from "../db/redis"
import { pushInferenceSchema } from "../schemas/queue";

export const pushInference = async(req: Request, res: Response)=>{
    const parsed = pushInferenceSchema.safeParse(req.body)
    if(!parsed.success){return res.status(403).json({
        message: "Invalid Inputs"
    })}
    const {modelId, datasetId} = parsed.data;
    const re = await redisClient.lPush("inference-queue", JSON.stringify({modelId:modelId, datasetId:datasetId}))
    if(re===1){
        return res.json({message: "Success"})
    }
}