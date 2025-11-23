import { Router } from "express";
import predictionsController from "../controllers/predictions";

export const router = Router();

router.post("/predictions", predictionsController.getPrediction);
router.post("/predictions-shap", predictionsController.getPredictionShap);
