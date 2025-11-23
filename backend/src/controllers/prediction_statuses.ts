import MongoDBClient from "../db/mongodb";
import { Request, Response } from "express";

class PredictionStatusesController extends MongoDBClient {
    constructor() {
        super(process.env.STATUS_DB || "statuses");
    }

    getPredictionStatuses = async (request: Request, response: Response) => {
        try {
            await this.connect(process.env.STATUS_DB || "statuses");

            const collectionName = process.env.PREDICTION_STATUS_COLLECTION || "prediction_statuses";
            const exists = await this.collectionExists(collectionName);
            
            if (!exists) {
                const collections = await this.db?.listCollections().toArray() || [];
                
                return response.status(404).json({ 
                    message: "Prediction status collection not found",
                    available_collections: collections.map(c => c.name)
                });
            }

            const statuses = await this.db!
                .collection(collectionName)
                .find({})
                .toArray();
            
            return response.json({ statuses });
        } catch (error) {
            console.error("Error in getPredictionStatuses:", error);
            return response.status(500).json({ 
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    };
}

const predictionStatusesController = new PredictionStatusesController();
export default predictionStatusesController;