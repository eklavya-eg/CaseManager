import { Router } from "express";
import { modelController } from "../controllers/model";
import { upload } from "../middleware/upload";

export const router = Router();

router.get("/model", modelController.getModels)
router.get("/model/:id", modelController.getModel)
router.post("/model", upload.single("file"), modelController.postModel)
router.delete("/model/:id", modelController.deleteModel)