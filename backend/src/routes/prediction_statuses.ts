import { Router } from "express";
import predictionStatusesController from "../controllers/prediction_statuses";

export const router = Router();

router.get("/prediction-statuses", predictionStatusesController.getPredictionStatuses);
