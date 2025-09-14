import { Router } from "express";
import { deleteDataset, getDataset, getDatasets, postDataset } from "../controllers/data";
import { upload } from "..";

const router = Router();

router.get("/data", getDatasets)
router.post("/data", upload.single("file"), postDataset)
router.get("/data/:id", getDataset)
router.delete("/data:id", deleteDataset)