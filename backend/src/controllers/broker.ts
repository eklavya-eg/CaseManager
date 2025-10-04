import { Request, Response } from "express";
import redisClient from "../db/redis"
import { pushInferenceSchema } from "../schemas/broker";

class BrokerController {
    constructor(){}
    async pushInference(req: Request, res: Response){
        const {success, data} = pushInferenceSchema.safeParse(req.body);
        if(!success){return res.status(400).json({
            message: "Wrong Inputs"
        })}
        const {modelId, datasetId} = data;
        const re = await redisClient.lPush("predict", JSON.stringify({model_id:modelId, data_id:datasetId}))
        if(re===1){
            return res.json({message: "Success"})
        }
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const brokerController = new BrokerController();