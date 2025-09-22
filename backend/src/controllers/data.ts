import { Request, Response } from "express";
import { prismaClient } from "../db/db";
import { datasetPost } from "../schemas/data";
import { BaseController } from "./base";

class DataController extends BaseController {
    constructor() {
        super(prismaClient.data);
    }
    async getDatasets(req: Request, res: Response) {
        try {
            const datasets = await this.findAll();
            return res.json(datasets);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async getDataset(req: Request, res: Response) {
        try {
            const dataset = await this.findById(req.params.id);
            return res.json(dataset);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async postDataset(req: Request, res: Response) {
        try {
            const { success, data } = datasetPost.safeParse(req.body);
            if (!success && !req.file) {
                return res.status(400).json({ message: "Wrong Inputs" });
            }
            const dataset = await this.create({
                ...data,
                data: req.file?.buffer
            });
            return res.json(dataset);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async deleteDataset(req: Request, res: Response) {
        try {
            const dataset = await this.delete(req.params.id);
            return res.json(dataset);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export const dataController = new DataController();