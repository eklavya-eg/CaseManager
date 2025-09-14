import { Request, Response } from "express";
import { prismaClient } from "../db/db";
import { datasetPost } from "../schemas/data";
import { pushInference } from "./queue";


export const getDatasets = async (req: Request, res: Response) => {
    try {
        const models = await prismaClient.data.findMany(
            {
                select: {data:false},
                orderBy: {uploadedAt: "desc"}
            }
        );
        return res.status(200).json({message: "Success", models})
    }
    catch {
       return res.status(500).json({message: "Failed"})
    }
}

export const getDataset = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        if(!id){return res.status(403).json({message:"Invalid Input"})}
        const model = await prismaClient.data.findFirst(
            {
                where: {id: id}
            }
        );
        if(!model){return res.status(404).json({message:"Failed"})}
        return res.status(200).json({message: "Success", model})
    }
    catch {
       return res.status(500).json({message: "Failed"})
    }
}

export const postDataset = async (req: Request, res: Response) => {
    try {
        const parsed = datasetPost.safeParse(req.body);
        if(!parsed.success){return res.status(403).json({message:"Invalid Input"})}
        const file = req.file;
        if(!file) {return res.status(403).json({message:"Invalid Input"})}
        const model = await prismaClient.data.create({
            data: {
                name: parsed.data.name,
                data: file.buffer
            }
        })
        return res.status(201).json({message: "Success", model})
    }
    catch {
        return res.status(500).json({message: "Failed"})
    }
}

export const deleteDataset = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        if(!id){return res.status(403).json({message:"Invalid Input"})}
        const model = await prismaClient.data.delete(
            {
                where: {id: id}
            }
        );
        if(!model){return res.status(404).json({message:"Failed"})}
        return res.status(203).json({message: "Success", model})
    }
    catch {
       return res.status(500).json({message: "Failed"})
    }
}