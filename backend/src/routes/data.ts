import { Router } from "express";
import { dataController } from "../controllers/data";
import { upload } from "../middleware/upload";

export const router = Router();

router.get("/data", dataController.getDatasets)
router.get("/data/:id", dataController.getDataset)
router.post("/data", upload.single("file"), dataController.postDataset)
router.delete("/data/:id", dataController.deleteDataset)