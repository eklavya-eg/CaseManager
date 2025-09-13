import { Request, Response } from "express";
import { prismaClient } from "../db/db"
import { modelPost } from "../schemas/model";

export const getModels = async (req: Request, res: Response) => {
    try {
        const models = await prismaClient.model.findMany(
            {
                select: {data:false},
                orderBy: {createdAt: "desc"}
            }
        );
        return res.status(200).json({message: "Success", models})
    }
    catch {
       return res.status(500).json({message: "Failed"})
    }
}

export const postModels = async (req: Request, res: Response) => {
    try {
        const parsed = modelPost.safeParse(req.body);
        if(!parsed.success){return res.status(404).json({message:"Invalid Input"})}
        const model = await prismaClient.model.create(
            {
                data: {name: ""}
            }
        );
        return res.status(201).json({message: "Success", model})
    }
    catch {
       return res.status(500).json({message: "Failed"})
    }
}