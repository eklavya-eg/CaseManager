import { Request, Response } from "express";
import { prismaClient } from "../db/db"
import { BaseController } from "./base";
import { modelPost } from "../schemas/model";

class ModelController extends BaseController {
    constructor(){
        super(prismaClient.model);
    }
    async getModels(req: Request, res: Response){
        try {
            const models = await this.findAll();
            return res.json(models);
        } catch (error) {
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
    async getModel(req: Request, res: Response){
        try {
            const model = await this.findById(req.params.id);
            return res.json(model);
        } catch (error) {
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
    async postModel(req: Request, res: Response){
        try {
            const {success, data} = modelPost.safeParse(req.body);
            if(!success && !req.file){
                return res.status(400).json({message: "Wrong Inputs"});
            }
            const model = await this.create({
                ...data,
                data: req.file?.buffer
            });
            return res.json(model);
        } catch (error) {
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
    async deleteModel(req: Request, res: Response){
        try {
            const model = await this.delete(req.params.id);
            return res.json(model);
        } catch (error) {
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
}

export const modelController = new ModelController();