import { Request, Response } from "express";
import prismaClient from "../db/db"
import { BaseController } from "./base";
import { modelPost } from "../schemas/model";
import fs from "fs/promises"

class ModelController extends BaseController {
    constructor() {
        super(prismaClient.model);
    }
    getModels =  async (req: Request, res: Response) => {
        try {
            const models = await this.findAll({
                id: true,
                name: true,
                type: true,
                createdAt: true
            });
            return res.json(models);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    getModel = async (req: Request, res: Response) => {
        try {
            const model = await this.findById(req.params.id);
            return res.json(model);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    postModel = async (req: Request, res: Response) => {
        try {
            const { success, data } = modelPost.safeParse(req.body);
            if (!success) {
                return res.status(400).json({ message: "Invalid model data", errors: data });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const buffer = await fs.readFile(req.file.path);
            const model = await this.create({
                ...data,
                data: buffer
            });
            return res.json({ model });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    deleteModel = async (req: Request, res: Response) => {
        try {
            const model = await this.delete(req.params.id);
            return res.json(model);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export const modelController = new ModelController();