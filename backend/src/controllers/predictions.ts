import { Request, Response } from "express";
import MongoDBClient from "../db/mongodb";
import { getPredictionSchema, getPredictionShapSchema } from "../schemas/predictions";
import { ObjectId } from "mongodb";

class PredictionsController extends MongoDBClient {
    constructor() {
        super(process.env.PREDICTION_DB || "predictions");
    }

    predictions = async (model_id: string, data_id: string) => {
        await this.connect(process.env.PREDICTION_DB || "predictions");
        
        const collection_name = `${model_id}_${data_id}`;
        const exists = await this.collectionExists(collection_name);
        
        if (exists) {
            return await this.db!
                .collection(collection_name)
                .find({}, { projection: { shap_values: 0 } })
                .toArray();
        } else {
            return [];
        }
    };

    predictionShap = async (model_id: string, data_id: string, row_id: string) => {
        await this.connect(process.env.PREDICTION_DB || "predictions");
        
        const collection_name = `${model_id}_${data_id}`;
        const exists = await this.collectionExists(collection_name);
        
        if (exists) {
            const prediction_shap_value = await this.db!
                .collection(collection_name)
                .findOne(
                    { _id: new ObjectId(row_id) },
                    { projection: { shap_values: 1 } }
                );
            return prediction_shap_value || null;
        } else {
            return null;
        }
    };

    getPrediction = async (request: Request, response: Response) => {
        const { success, data } = getPredictionSchema.safeParse(request.body);
        
        if (!success) {
            return response.status(400).json({ 
                message: "Invalid request body", 
                errors: data 
            });
        }
        
        const { model_id, data_id } = data;

        try {
            console.log(`Fetching predictions for model: ${model_id}, data: ${data_id}`);
            const predictions = await this.predictions(model_id, data_id);
            
            return response.json({ 
                predictions,
                count: predictions.length 
            });
        } catch (error) {
            console.error("Error in getPrediction:", error);
            return response.status(500).json({ 
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    };

    getPredictionShap = async (request: Request, response: Response) => {
        const { success, data } = getPredictionShapSchema.safeParse(request.body);
        
        if (!success) {
            return response.status(400).json({ 
                message: "Invalid request body", 
                errors: data 
            });
        }

        const { model_id, data_id, row_id } = data;

        try {
            console.log(`Fetching SHAP values for model: ${model_id}, data: ${data_id}, row: ${row_id}`);
            const prediction_shap_value = await this.predictionShap(model_id, data_id, row_id);
            
            if (!prediction_shap_value) {
                return response.status(404).json({ 
                    message: "Prediction not found" 
                });
            }

            return response.json({ 
                shap_values: prediction_shap_value.shap_values || [] 
            });
        } catch (error) {
            console.error("Error in getPredictionShap:", error);
            return response.status(500).json({ 
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    };
}

const predictionsController = new PredictionsController();
export default predictionsController;