import csv from "csv-parser";
import { Request, Response } from "express";
import { createReadStream } from "fs";
import fs from "fs/promises";
import prismaClient from "../db/db";
import { datasetPost } from "../schemas/data";
import { BaseController } from "./base";

class DataController extends BaseController {
    constructor() {
        super(prismaClient.data);
    }
    getDatasets = async (req: Request, res: Response) => {
        try {
            const datasets = await this.findAll({
                id: true,
                name: true,
                columns: true,
                uploadedAt: true
            });
            return res.json(datasets);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    getDataset = async (req: Request, res: Response) => {
        try {
            const dataset = await this.findById(req.params.id);
            return res.json(dataset);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    postDataset = async (req: Request, res: Response) => {
        try {
            const { success, data } = datasetPost.safeParse(req.body);
            if (!success) {
                return res.status(400).json({ message: "Invalid dataset data", errors: data });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const buffer = await fs.readFile(req.file.path);
            const getHeaders = (path: string) => {
                return new Promise<string[]>(resolve => {
                    createReadStream(path)
                        .pipe(csv())
                        .on("headers", headers => {
                            resolve(headers)
                        });
                })
            }
            const headers = await getHeaders(req.file.path);
            const dataset = await this.create({
                ...data,
                columns: headers,
                data: buffer
            });
            // delete dataset[data]
            return res.json({ dataset });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    deleteDataset = async (req: Request, res: Response) => {
        try {
            const dataset = await this.delete(req.params.id);
            return res.json(dataset);
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export const dataController = new DataController();