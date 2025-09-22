import { Router } from "express";
import { modelController } from "../controllers/model";
import { upload } from "..";

export const router = Router();

router.get("/model", modelController.getModels)
router.post("/model", upload.single("file"), modelController.postModel)
router.get("/model/:id", modelController.getModel)
router.delete("/model:id", modelController.deleteModel)