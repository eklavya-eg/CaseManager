import { Request, Response } from "express";
import redisClient from "../db/redis"
import { pushInferenceSchema } from "../schemas/broker";
import prismaClient from "../db/db";

class BrokerController {
    constructor(){}

    getModelName = async (modelId: string)=>{
        const modelName = await prismaClient.model.findUnique({
            select: {name: true},
            where: {id: modelId}
        })
        return modelName?.name || ""
    }
    getDatasetName = async (datasetId: string)=>{
        const datasetName = await prismaClient.data.findUnique({
            select: {name: true},
            where: {id: datasetId}
        })
        return datasetName?.name || ""
    }
    pushInference = async (req: Request, res: Response)=>{
        const {success, data} = pushInferenceSchema.safeParse(req.body);
        if(!success){return res.status(400).json({
            message: "Wrong Inputs"
        })}
        const {modelId, datasetId, accuracy_check, columnName} = data;
        if(accuracy_check===true){
            if(columnName==undefined){
                return res.status(400).json({
                    message: "Wrong Inputs"
                })
            } else {
                const columns = await prismaClient.data.findFirst({
                    where: {id:datasetId},
                    select: {columns:true}
                })

                if(columns===null || columns.columns.includes(columnName)==false){
                    return res.status(400).json({
                        message: "Wrong Inputs"
                    })
                }

                const re = await redisClient.lPush("predict", JSON.stringify({
                    model_id:modelId,
                    data_id:datasetId,
                    accuracy_check:true,
                    column_name:columnName,
                }))
                if(re===1){
                    return res.json({message: "Success"})
                }
            }
        } else {
            const re = await redisClient.lPush("predict", JSON.stringify({
                model_id:modelId,
                data_id:datasetId,
                accuracy_check:false,
                column_name:null,
            }))
            if(re===1){
                return res.json({message: "Success"})
            }
        }
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const brokerController = new BrokerController();
