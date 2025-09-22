import { Router } from "express";
import { dataController } from "../controllers/data";
import { upload } from "..";

export const router = Router();

router.get("/data", dataController.getDatasets)
router.post("/data", upload.single("file"), dataController.postDataset)
router.get("/data/:id", dataController.getDataset)
router.delete("/data:id", dataController.deleteDataset)